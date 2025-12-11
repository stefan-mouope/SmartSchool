#!/bin/bash

NAMESPACE="smartschool"

echo "=============================================================="
echo " 🚀 DEPLOY SMARTSCHOOL — BUILD + DEPLOY KUBERNETES"
echo "=============================================================="

echo "🔧 Namespace : $NAMESPACE"
kubectl create namespace $NAMESPACE 2>/dev/null || echo "⚠️  Namespace existe déjà."

###############################################################################
# 1️⃣ - BUILD DES IMAGES DOCKER (MINIKUBE)
##############################################################################
build_images() {
    if ! command -v docker >/dev/null 2>&1; then
        echo "⚠️  docker non détecté — skip build"
        return 0
    fi

    echo "=============================================================="
    echo " 🔨 BUILD DES IMAGES DOCKER (nom-service:latest)"
    echo "=============================================================="

    IMAGES=(
        "config-service:./smartSchool-config/config-service"
        "registry-service:./smartSchool-config/registry-service"
        "proxy-service:./smartSchool-config/proxy-service"
        "registration-service:./SmartSchool-backend/registration-service"
        "inscription-service:./SmartSchool-backend/inscription-service"
        "service-notes:./SmartSchool-backend/service-notes"
        "authentification-service:./SmartSchool-backend/systeme_authentification"
        "frontend-service:./SmartSchool-front"
    )

    USE_MINIKUBE=true

    for entry in "${IMAGES[@]}"; do
        name="${entry%%:*}"
        ctx="${entry#*:}"
        image="${name}:latest"

        echo "→ Build : $image  (context: $ctx)"

        if [ ! -d "$ctx" ]; then
            echo "   ❌ Dossier introuvable : $ctx — SKIP"
            continue
        fi

        docker build -t "$image" "$ctx" || {
            echo "   ❌ Build échoué pour $name"
            exit 1
        }

        if [ "$USE_MINIKUBE" = true ]; then
            echo "   🧹 Nettoyage ancienne image dans Minikube..."
            minikube ssh "docker rmi $image 2>/dev/null || true"

            echo "   ⬆️  Load dans Minikube : $image"
            minikube image load "$image"
        fi
    done

    echo "✅ Build + load dans Minikube terminé."
}

# Build seulement si pas désactivé
if [ "${DISABLE_IMAGE_BUILD:-false}" != "true" ]; then
    build_images
fi

###############################################################################
# 2️⃣ - FUNCTION WAIT READY
###############################################################################
wait_for_service_ready() {
    local label=$1
    local name=$2

    echo "⏳ Attente du service : $name"
    kubectl wait --for=condition=ready pod -l app=$label -n $NAMESPACE --timeout=180s || {
        echo "❌ Timeout d'attente : $name"
        kubectl get pods -n $NAMESPACE
        exit 1
    }
}

###############################################################################
# 3️⃣ - DEPLOIEMENT DES COMPOSANTS
###############################################################################
echo "=============================================================="
echo " 📦 DEPLOYMENT KUBERNETES"
echo "=============================================================="

echo "🗑 Suppression de tous les pods/services existants..."
kubectl delete all --all -n $NAMESPACE 2>/dev/null || true

# PostgreSQL
echo "🐘 PostgreSQL..."
kubectl apply -f k8s/postgres/pvc.yml -n $NAMESPACE
kubectl apply -f k8s/postgres/init-configmap.yml -n $NAMESPACE
kubectl apply -f k8s/postgres/deployment.yml -n $NAMESPACE
kubectl apply -f k8s/postgres/service.yml -n $NAMESPACE
wait_for_service_ready "postgres" "PostgreSQL"

# Services principaux
SERVICES=(
    "config-service"
    "registry-service"
    "proxy-service"
    "rabbitmq-service"
    "inscription-service"
    "registration-service"
    "service-notes"
    "authentification-service"
    "frontend-service"
)

for svc in "${SERVICES[@]}"; do
    echo "🟩 Déploiement : $svc"
    kubectl apply -f k8s/$svc/deployment.yml -n $NAMESPACE
    kubectl apply -f k8s/$svc/service.yml -n $NAMESPACE
    wait_for_service_ready "$svc" "$svc"
done

###############################################################################
# 4️⃣ - FORCE RESTART POUR CHARGER LES NOUVELLES IMAGES
###############################################################################
echo "=============================================================="
echo " 🔄 RESTART DES DEPLOYMENTS (nouvelles images)"
echo "=============================================================="

for svc in "${SERVICES[@]}"; do
    deploy="${svc}-deployment"
    echo "🔄 Restart : $deploy"
    kubectl rollout restart deployment/$deploy -n $NAMESPACE 2>/dev/null && \
    kubectl rollout status deployment/$deploy -n $NAMESPACE --timeout=120s || \
    echo "⚠️  Problème avec $deploy"
done

echo "=============================================================="
echo " ********** DEPLOIEMENT TERMINÉ ! TOUS LES SERVICES SONT PRÊTS.********"
echo "=============================================================="

###############################################################################
# 5️⃣ - PORT-FORWARD
###############################################################################
echo "=============================================================="
echo "  ***********LANCEMENT DES SERVICE EN LOCAL*****************"
echo "=============================================================="

echo "🧹 Suppression des anciens port-forward..."
pkill -f "kubectl port-forward" 2>/dev/null || true

echo "🔌 Port-forward des services..."
kubectl port-forward -n $NAMESPACE service/registry-service 8761:8761 &
echo "Registry Service -> http://localhost:8761"

kubectl port-forward -n $NAMESPACE service/proxy-service 8081:8081 &
echo "Proxy Service -> http://localhost:8081"

kubectl port-forward -n $NAMESPACE service/frontend-service 8082:8082 &
echo "Frontend Service -> http://localhost:8082"
