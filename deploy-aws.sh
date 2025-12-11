#!/bin/bash

# ===================================
# CONFIGURATION AWS EKS + ECR
# ===================================
AWS_REGION="eu-west-1"
AWS_ACCOUNT_ID="010912112706"
NAMESPACE="smartschool"
ECR_URL="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/smartschool"

echo "=============================================================="
echo " 🚀 DEPLOY SMARTSCHOOL — AWS EKS"
echo "=============================================================="
echo "🌍 Namespace : $NAMESPACE"

kubectl create namespace $NAMESPACE 2>/dev/null || echo "⚠️ Namespace déjà existant"

###############################################################################
# 1️⃣ AUTH AWS ECR
###############################################################################
echo "=============================================================="
echo " 🔐 Connexion à AWS ECR"
echo "=============================================================="

aws ecr get-login-password --region $AWS_REGION | docker login \
    --username AWS \
    --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

###############################################################################
# 2️⃣ BUILD + PUSH DES IMAGES VERS ECR (Optionnel)
###############################################################################
BUILD_IMAGES="${BUILD_IMAGES:-false}"  # ✅ Variable pour activer/désactiver

if [ "$BUILD_IMAGES" = "true" ]; then
    echo "=============================================================="
    echo " 🔨 BUILD & PUSH IMAGES → AWS ECR"
    echo "=============================================================="

    IMAGES=(
        # "config-service:./smartSchool-config/config-service"
        # "registry-service:./smartSchool-config/registry-service"
        # "proxy-service:./smartSchool-config/proxy-service"
        # "registration-service:./SmartSchool-backend/registration-service"
        # "inscription-service:./SmartSchool-backend/inscription-service"
        # "service-notes:./SmartSchool-backend/service-notes"
        # "authentification-service:./SmartSchool-backend/systeme_authentification"
        # "frontend-service:./SmartSchool-front"
    )

    for entry in "${IMAGES[@]}"; do
        name="${entry%%:*}"
        ctx="${entry#*:}"
        image="$ECR_URL/$name:latest"

        echo "→ Build : $image (context $ctx)"

        if [ ! -d "$ctx" ]; then
            echo "❌ Dossier introuvable : $ctx — skip"
            continue
        fi

        docker build -t "$image" "$ctx" || {
            echo "❌ Build échoué pour $name"
            exit 1
        }
        
        docker push "$image" || {
            echo "❌ Push échoué pour $name"
            exit 1
        }
    done
else
    echo "ℹ️  Build désactivé (BUILD_IMAGES=false)"
    echo "   Les images existantes sur ECR seront utilisées"
fi

###############################################################################
# 3️⃣ FUNCTION WAIT READY
###############################################################################
wait_for_ready() {
    local label=$1
    local name=${2:-$label}
    
    echo "⏳ Attente du service : $name"
    
    if kubectl wait --for=condition=ready pod -l app=$label -n $NAMESPACE --timeout=200s; then
        echo "✅ $name est prêt"
    else
        echo "❌ Timeout pour $name"
        kubectl get pods -n $NAMESPACE -l app=$label
        return 1
    fi
}

###############################################################################
# 4️⃣ DEPLOYMENT DE L'INFRASTRUCTURE
###############################################################################
echo "=============================================================="
echo " 📦 DÉPLOIEMENT INFRASTRUCTURE"
echo "=============================================================="

# PostgreSQL
echo "🐘 PostgreSQL..."
kubectl apply -f k8s-aws/postgres/pvc.yml -n $NAMESPACE
kubectl apply -f k8s-aws/postgres/init-configmap.yml -n $NAMESPACE
kubectl apply -f k8s-aws/postgres/deployment.yml -n $NAMESPACE
kubectl apply -f k8s-aws/postgres/service.yml -n $NAMESPACE
wait_for_ready "postgres" "PostgreSQL"

# RabbitMQ (AVANT les services qui l'utilisent)
echo "🐇 RabbitMQ..."
kubectl apply -f k8s-aws/rabbitmq-service/deployment.yml -n $NAMESPACE
kubectl apply -f k8s-aws/rabbitmq-service/service.yml -n $NAMESPACE
wait_for_ready "rabbitmq-service" "RabbitMQ"

# Config Service
echo "🟦 Config Service..."
kubectl apply -f k8s-aws/config-service/deployment.yml -n $NAMESPACE
kubectl apply -f k8s-aws/config-service/service.yml -n $NAMESPACE
wait_for_ready "config-service" "Config Service"

sleep 5

# Registry Service (Eureka)
echo "🟧 Registry Service..."
kubectl apply -f k8s-aws/registry-service/deployment.yml -n $NAMESPACE
kubectl apply -f k8s-aws/registry-service/service.yml -n $NAMESPACE
wait_for_ready "registry-service" "Registry Service"

sleep 5

# Proxy Service (Gateway)
echo "🟥 Proxy Service..."
kubectl apply -f k8s-aws/proxy-service/deployment.yml -n $NAMESPACE
kubectl apply -f k8s-aws/proxy-service/service.yml -n $NAMESPACE
wait_for_ready "proxy-service" "Proxy Service"

###############################################################################
# 5️⃣ DEPLOYMENT DES MICROSERVICES
###############################################################################
echo "=============================================================="
echo " 🔧 DÉPLOIEMENT MICROSERVICES"
echo "=============================================================="

MICROSERVICES=(
    "registration-service"
    "inscription-service"
    "service-notes"
    "authentification-service"
    "frontend-service"
)

for svc in "${MICROSERVICES[@]}"; do
    echo "🟢 Déploiement : $svc"
    kubectl apply -f k8s-aws/$svc/deployment.yml -n $NAMESPACE
    kubectl apply -f k8s-aws/$svc/service.yml -n $NAMESPACE
    wait_for_ready "$svc" "$svc"
done

###############################################################################
# 6️⃣ DEPLOIEMENT DE L'INGRESS (AWS ALB)
###############################################################################
echo "=============================================================="
echo " 🌐 DEPLOIEMENT DE L'INGRESS (AWS ALB)"
echo "=============================================================="

# Vérifier si le fichier existe (.yml ou .yaml)
if [ -f "k8s-aws/ingress.yml" ]; then
    INGRESS_FILE="k8s-aws/ingress.yml"
elif [ -f "k8s-aws/ingress.yaml" ]; then
    INGRESS_FILE="k8s-aws/ingress.yaml"
else
    echo "❌ Fichier ingress introuvable (ingress.yml ou ingress.yaml)"
    exit 1
fi

kubectl apply -f "$INGRESS_FILE" -n $NAMESPACE

echo "⏳ Attente de la création du Load Balancer (ALB)..."
echo "   (Cela peut prendre 2-3 minutes...)"

# Récupération automatique du DNS de l'ALB
ALB_HOSTNAME=""
MAX_WAIT=180  # 3 minutes max
ELAPSED=0

while [ -z "$ALB_HOSTNAME" ] && [ $ELAPSED -lt $MAX_WAIT ]; do
    ALB_HOSTNAME=$(kubectl get ingress smartschool-ingress -n $NAMESPACE \
        -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null)
    
    if [ -z "$ALB_HOSTNAME" ]; then
        echo "   🔎 Recherche de l'ALB... ($ELAPSED/$MAX_WAIT secondes)"
        sleep 10
        ELAPSED=$((ELAPSED + 10))
    fi
done

if [ -z "$ALB_HOSTNAME" ]; then
    echo "⚠️  Load Balancer pas encore prêt après $MAX_WAIT secondes"
    echo "   Vérifiez manuellement avec : kubectl get ingress -n $NAMESPACE"
else
    echo "=============================================================="
    echo " 🌍 TON APPLICATION EST DISPONIBLE ICI :"
    echo " 👉 http://$ALB_HOSTNAME"
    echo "=============================================================="
fi

###############################################################################
# 7️⃣ ROLLOUT RESTART (optionnel)
###############################################################################
RESTART_DEPLOYMENTS="${RESTART_DEPLOYMENTS:-false}"

if [ "$RESTART_DEPLOYMENTS" = "true" ]; then
    echo "=============================================================="
    echo " 🔄 ROLLOUT RESTART DES DEPLOYMENTS"
    echo "=============================================================="

    ALL_SERVICES=(
        "config-service"
        "registry-service"
        "proxy-service"
        "registration-service"
        "inscription-service"
        "service-notes"
        "authentification-service"
        "frontend-service"
    )

    for svc in "${ALL_SERVICES[@]}"; do
        echo "🔄 Restart : $svc"
        kubectl rollout restart deployment/$svc-deployment -n $NAMESPACE 2>/dev/null || {
            echo "⚠️  Deployment $svc-deployment introuvable"
        }
    done

    # Attendre que tous les rollouts soient terminés
    for svc in "${ALL_SERVICES[@]}"; do
        kubectl rollout status deployment/$svc-deployment -n $NAMESPACE --timeout=120s 2>/dev/null
    done
fi

###############################################################################
# 8️⃣ RÉSUMÉ FINAL
###############################################################################
echo ""
echo "=============================================================="
echo " 🎉 DÉPLOIEMENT COMPLET : SMARTSCHOOL SUR AWS EKS"
echo "=============================================================="
echo ""
echo "📊 État des pods :"
kubectl get pods -n $NAMESPACE
echo ""
echo "🌐 Services :"
kubectl get svc -n $NAMESPACE
echo ""
echo "🔗 Ingress :"
kubectl get ingress -n $NAMESPACE
echo ""

if [ -n "$ALB_HOSTNAME" ]; then
    echo "🌍 Accès Frontend : http://$ALB_HOSTNAME"
    echo "🔍 Eureka Dashboard : http://$ALB_HOSTNAME/eureka"
    echo "🔌 API Gateway : http://$ALB_HOSTNAME/api"
else
    echo "⚠️  Pour récupérer l'URL plus tard :"
    echo "   kubectl get ingress smartschool-ingress -n $NAMESPACE"
fi

echo ""
echo "=============================================================="