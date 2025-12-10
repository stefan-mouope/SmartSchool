#!/bin/bash

NAMESPACE="smartschool"

echo "✅ Vérification du namespace..."
kubectl create namespace $NAMESPACE 2>/dev/null || echo "Le namespace existe déjà."

echo "⏳ Déploiement de tous les services..."

for d in k8s/*/ ; do
    if [ -f "${d}service.yml" ]; then
        svc_name=$(basename "$d")
        echo "Déploiement du service: $svc_name"
        kubectl apply -f "${d}service.yml" -n $NAMESPACE
    fi
done

echo "🎉 Tous les services ont été déployés !"
kubectl get svc -n $NAMESPACE
