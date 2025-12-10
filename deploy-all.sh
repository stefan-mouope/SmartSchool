#!/bin/bash

NAMESPACE="smartschool"

# ---------------------------------------------------------------------------
# Création du namespace si nécessaire
# ---------------------------------------------------------------------------
echo "✅ Création du namespace..."
kubectl create namespace $NAMESPACE 2>/dev/null || echo "Le namespace existe déjà."

# ---------------------------------------------------------------------------
# Fonction pour attendre qu’un pod soit READY
# ---------------------------------------------------------------------------
wait_for_service_ready() {
    local label=$1
    local name=$2
    local timeout=${3:-180}  # 180s par défaut

    echo "⏳ Attente que $name soit prêt (timeout ${timeout}s)..."
    if ! kubectl wait --for=condition=ready pod -l app=$label -n $NAMESPACE --timeout=${timeout}s; then
        echo "⚠️  Timeout atteint pour $name. Vérifie les logs avec :"
        echo "   kubectl logs -l app=$label -n $NAMESPACE"
    else
        echo "✅ $name est prêt !"
    fi
}

# ---------------------------------------------------------------------------
# Déploiement PostgreSQL
# ---------------------------------------------------------------------------
echo "🟦 Déploiement de PostgreSQL..."
kubectl apply -f k8s/postgres/pvc.yml -n $NAMESPACE
kubectl apply -f k8s/postgres/init-configmap.yml -n $NAMESPACE
kubectl apply -f k8s/postgres/deployment.yml -n $NAMESPACE
kubectl apply -f k8s/postgres/service.yml -n $NAMESPACE
wait_for_service_ready "postgres" "PostgreSQL"

# ---------------------------------------------------------------------------
# Déploiement Config Service (doit démarrer avant les autres)
# ---------------------------------------------------------------------------
echo "🟦 Déploiement de Config Service..."
kubectl apply -f k8s/config-service/deployment.yml -n $NAMESPACE
kubectl apply -f k8s/config-service/service.yml -n $NAMESPACE
wait_for_service_ready "config-service" "Config Service"

# Petit délai pour être sûr que Config Service est stable
sleep 5

# ---------------------------------------------------------------------------
# Déploiement Registry Service (dépend de Config Service)
# ---------------------------------------------------------------------------
echo "🟧 Déploiement de Registry Service..."
kubectl apply -f k8s/registry-service/deployment.yml -n $NAMESPACE
kubectl apply -f k8s/registry-service/service.yml -n $NAMESPACE
wait_for_service_ready "registry-service" "Registry Service"

sleep 5

# ---------------------------------------------------------------------------
# Déploiement Proxy Service (dépend de Registry)
# ---------------------------------------------------------------------------
echo "🟥 Déploiement de Proxy Service..."
kubectl apply -f k8s/proxy-service/deployment.yml -n $NAMESPACE
kubectl apply -f k8s/proxy-service/service.yml -n $NAMESPACE
wait_for_service_ready "proxy-service" "Proxy Service"

sleep 5

# ---------------------------------------------------------------------------
# Déploiement RabbitMQ
# ---------------------------------------------------------------------------
echo "🟨 Déploiement de RabbitMQ..."
kubectl apply -f k8s/rabbitmq-service/deployment.yml -n $NAMESPACE
kubectl apply -f k8s/rabbitmq-service/service.yml -n $NAMESPACE
wait_for_service_ready "rabbitmq-service" "RabbitMQ"

# ---------------------------------------------------------------------------
# Déploiement des autres microservices
# ---------------------------------------------------------------------------
SERVICES=(
    "inscription-service"
    "registration-service"
    "service-notes"
    "authentification-service"
    "frontend-service"
)

for svc in "${SERVICES[@]}"; do
    echo "🟫 Déploiement de ${svc^}..."
    kubectl apply -f k8s/$svc/deployment.yml -n $NAMESPACE
    kubectl apply -f k8s/$svc/service.yml -n $NAMESPACE
    wait_for_service_ready "$svc" "$svc"
done

echo "✅ Déploiement terminé !"

echo "delete all forward "
pkill -f "kubectl port-forward"

Port-forward des services
kubectl port-forward service/registry-service 8761:8761 -n $NAMESPACE &
echo "Registry Service -> http://localhost:8761"

kubectl port-forward service/proxy-service 8081:8081 -n $NAMESPACE &
echo "Proxy Service -> http://localhost:8081"

kubectl port-forward service/frontend-service 8082:8082 -n $NAMESPACE &
echo "Frontend Service -> http://localhost:8082"
