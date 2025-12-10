#!/bin/bash

# ===================================
# Script de bascule intelligent
# ===================================

echo "=============================================================="
echo " 🔄 BASCULEUR DE MODE DEPLOYMENT"
echo "=============================================================="
echo ""

# Détecter le mode actuel
current_mode="unknown"

# Vérifier si les deployments utilisent Docker Hub ou local
sample_file=$(find k8s -name "deployment.yml" -type f | head -1)

if [ -f "$sample_file" ]; then
    if grep -q "imagePullPolicy: Never" "$sample_file"; then
        current_mode="minikube"
    elif grep -q "imagePullPolicy: Always" "$sample_file"; then
        current_mode="dockerhub"
    fi
fi

echo "📍 Mode actuel détecté : $current_mode"
echo ""

# Proposer les options
echo "Choisissez le mode de déploiement :"
echo ""
echo "  1) 🐳 Docker Hub (images distantes)"
echo "  2) 🔧 Minikube (images locales)"
echo "  3) ❌ Annuler"
echo ""

read -p "Votre choix [1-3] : " choice

case $choice in
    1)
        echo ""
        if [ "$current_mode" = "dockerhub" ]; then
            echo "ℹ️  Vous êtes déjà en mode Docker Hub"
        else
            ./use-dockerhub.sh
        fi
        ;;
    2)
        echo ""
        if [ "$current_mode" = "minikube" ]; then
            echo "ℹ️  Vous êtes déjà en mode Minikube"
        else
            ./use-minikube.sh
        fi
        ;;
    3)
        echo ""
        echo "❌ Opération annulée"
        exit 0
        ;;
    *)
        echo ""
        echo "❌ Choix invalide"
        exit 1
        ;;
esac