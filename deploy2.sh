#!/bin/bash

# ===================================
# Configuration
# ===================================
NAMESPACE="smartschool"
DOCKER_USERNAME="sandjonyves"  # ✅ Votre username Docker Hub
DOCKER_PUSH="${DOCKER_PUSH:-true}"  # Push automatique sur Docker Hub
KIND_CLUSTER="${KIND_CLUSTER:-false}"
MINIKUBE="${MINIKUBE:-false}"

echo "=============================================================="
echo " 🚀 DEPLOY SMARTSCHOOL — BUILD + DEPLOY KUBERNETES"
echo "=============================================================="
echo "🔧 Namespace : $NAMESPACE"
kubectl create namespace $NAMESPACE 2>/dev/null || echo "⚠️  Namespace existe déjà."

###############################################################################
# 1️⃣ - BUILD DES IMAGES DOCKER
###############################################################################
build_images() {
    if ! command -v docker >/dev/null 2>&1; then
        echo "⚠️  docker non détecté — skip build"
        return 0
    fi

    IMAGES=(
        # "config-service:./smartSchool-config/config-service"
        # "registry-service:./smartSchool-config/registry-service"
        # "proxy-service:./smartSchool-config/proxy-service"
        # "registration-service:./SmartSchool-backend/registration-service"
        # "inscription-service:./SmartSchool-backend/inscription-service"
        # "service-notes:./SmartSchool-backend/service-notes"
        # "authentification-service:./SmartSchool-backend/systeme_authentification"
        "frontend-service:./SmartSchool-front"
    )

    echo "=============================================================="
    echo " 🔨 BUILD DES IMAGES DOCKER"
    echo "=============================================================="

    for entry in "${IMAGES[@]}"; do
        name="${entry%%:*}"
        ctx="${entry#*:}"
        image="$DOCKER_USERNAME/$name:latest"

        echo "→ Build : $image  (context: $ctx)"

        if [ ! -d "$ctx" ]; then
            echo "   ❌ Dossier introuvable : $ctx — SKIP"
            continue
        fi

        docker build -t "$image" "$ctx" || {
            echo "   ❌ Build échoué pour $name"
            exit 1
        }

        # Load into kind/minikube
        if [ "$KIND_CLUSTER" = "true" ]; then
            echo "   ⬆️  Load dans kind"
            kind load docker-image "$image"
        elif [ "$MINIKUBE" = "true" ]; then
            echo "   ⬆️  Load dans minikube"
            minikube image load "$image"
        fi

        # Push sur Docker Hub
        if [ "$DOCKER_PUSH" = "true" ]; then
            echo "   📤 Push → Docker Hub"
            docker push "$image" || {
                echo "   ❌ Push échoué pour $name"
                exit 1
            }
        fi
    done

    echo "✅ Build & Push des images terminé."
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

echo "delete all pods service deployment"
kubectl delete all --all -n $NAMESPACE

# PostgreSQL
echo "🐘 PostgreSQL..."
kubectl apply -f k8s/postgres/pvc.yml -n $NAMESPACE
kubectl apply -f k8s/postgres/init-configmap.yml -n $NAMESPACE
kubectl apply -f k8s/postgres/deployment.yml -n $NAMESPACE
kubectl apply -f k8s/postgres/service.yml -n $NAMESPACE
wait_for_service_ready "postgres" "PostgreSQL"

# Services principaux
SERVICES=("config-service" "registry-service" "proxy-service" "rabbitmq-service" "inscription-service" "registration-service" "service-notes" "authentification-service" "frontend-service")

for svc in "${SERVICES[@]}"; do
    echo "🟩 Déploiement : $svc"
    kubectl apply -f k8s/$svc/deployment.yml -n $NAMESPACE
    kubectl apply -f k8s/$svc/service.yml -n $NAMESPACE
    wait_for_service_ready "$svc" "$svc"
    sleep 3
done

###############################################################################
# 4️⃣ - RESTART DES DEPLOYMENTS POUR CHARGER LES NOUVELLES IMAGES
###############################################################################
echo "=============================================================="
echo " 🔄 RESTART DES DEPLOYMENTS (nouvelles images)"
echo "=============================================================="

for deploy in "${SERVICES[@]}"; do
    echo "🔄 Restart : $deploy-deployment"
    kubectl rollout restart deployment/$deploy-deployment -n $NAMESPACE 2>/dev/null && \
    kubectl rollout status deployment/$deploy-deployment -n $NAMESPACE --timeout=120s || \
    echo "⚠️  Problème avec $deploy-deployment"
done

echo "=============================================================="
echo " ********** DEPLOIEMENT TERMINÉ ! TOUS LES SERVICES SONT PRÊTS.********"
echo "=============================================================="

###############################################################################
# 5️⃣ - PORT-FORWARD
###############################################################################
echo "=============================================================="
echo "  ***********LANCEMENT DES SERVICES EN LOCAL*****************"
echo "=============================================================="

echo "🧹 Suppression des anciens port-forward..."
pkill -f "kubectl port-forward" || true

echo "🔌 Port-forward des services..."
kubectl port-forward -n $NAMESPACE service/registry-service 8761:8761 &
echo "Registry Service -> http://localhost:8761"

kubectl port-forward -n $NAMESPACE service/proxy-service 8081:8081 &
echo "Proxy Service -> http://localhost:8081"

kubectl port-forward -n $NAMESPACE service/frontend-service 8082:8082 &
echo "Frontend Service -> http://localhost:8082"
