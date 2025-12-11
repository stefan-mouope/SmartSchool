#!/bin/bash

# ===================================
# Configuration Docker Hub
# ===================================
DOCKER_USERNAME="sandjonyves"  # ✅ Votre vrai username Docker Hub

echo "=============================================================="
echo " 🐳 CONFIGURATION POUR DOCKER HUB"
echo "=============================================================="
echo "Username Docker Hub : $DOCKER_USERNAME"
echo ""

# Compter les fichiers à modifier
total=$(find k8s -name "deployment.yml" -type f | wc -l)
echo "📋 Fichiers deployment trouvés : $total"
echo ""

# Sauvegarder les fichiers originaux
echo "💾 Création de backups..."
find k8s -name "deployment.yml" -type f -exec cp {} {}.minikube.bak \;
echo "✅ Backups créés (*.minikube.bak)"
echo ""

# Modifier tous les deployments pour Docker Hub
echo "🔄 Modification des deployments pour Docker Hub..."
find k8s -name "deployment.yml" -type f -exec sed -i \
    -e "s|image: \([^/]*\):latest|image: $DOCKER_USERNAME/\1:latest|g" \
    -e "s|image: \([^/]*\):v[0-9.]*|image: $DOCKER_USERNAME/\1:latest|g" \
    -e "s|imagePullPolicy: Never|imagePullPolicy: Always|g" \
    -e "s|imagePullPolicy: IfNotPresent|imagePullPolicy: Always|g" \
    {} \;

echo "✅ Tous les deployments configurés pour Docker Hub"
echo ""

# Afficher un résumé des modifications
echo "📊 Résumé des modifications :"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

find k8s -name "deployment.yml" -type f | while read -r file; do
    service=$(echo "$file" | sed 's|k8s/||' | sed 's|/deployment.yml||')
    image=$(grep "image:" "$file" | head -1 | awk '{print $2}')
    pullPolicy=$(grep "imagePullPolicy:" "$file" | head -1 | awk '{print $2}')
    
    echo "✓ $service"
    echo "  └─ Image: $image"
    echo "  └─ Pull Policy: $pullPolicy"
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 Prochaines étapes :"
echo "  1. Assurez-vous que vos images sont sur Docker Hub :"
echo "     ./build-and-push.sh"
echo ""
echo "  2. Déployez avec Docker Hub :"
echo "     ./deploy.sh"
echo ""
echo "  3. Pour revenir à Minikube :"
echo "     ./use-minikube.sh"
echo ""
