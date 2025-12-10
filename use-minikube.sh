#!/bin/bash

echo "=============================================================="
echo " 🔧 CONFIGURATION POUR MINIKUBE (LOCAL)"
echo "=============================================================="
echo ""

# Vérifier si Minikube est actif
if ! minikube status &>/dev/null; then
    echo "⚠️  Minikube n'est pas démarré !"
    echo ""
    echo "Démarrez Minikube avec :"
    echo "  minikube start"
    echo ""
    exit 1
fi

# Compter les fichiers à modifier
total=$(find k8s -name "deployment.yml" -type f | wc -l)
echo "📋 Fichiers deployment trouvés : $total"
echo ""

# Vérifier si des backups existent
if find k8s -name "*.minikube.bak" -type f | grep -q .; then
    echo "💾 Restauration depuis les backups..."
    find k8s -name "deployment.yml.minikube.bak" -type f | while read -r backup; do
        original="${backup%.minikube.bak}"
        cp "$backup" "$original"
        echo "  ✓ Restauré : $original"
    done
    echo ""
else
    echo "ℹ️  Aucun backup trouvé, modification directe..."
    echo ""
    
    # Sauvegarder les fichiers originaux
    echo "💾 Création de backups..."
    find k8s -name "deployment.yml" -type f -exec cp {} {}.dockerhub.bak \;
    echo "✅ Backups créés (*.dockerhub.bak)"
    echo ""
fi

# Modifier tous les deployments pour Minikube
echo "🔄 Modification des deployments pour Minikube..."

find k8s -name "deployment.yml" -type f -exec sed -i \
    -e "s|image: [^/]*/\([^:]*\):.*|image: \1:latest|g" \
    -e "s|imagePullPolicy: Always|imagePullPolicy: Never|g" \
    -e "s|imagePullPolicy: IfNotPresent|imagePullPolicy: Never|g" \
    {} \;

echo "✅ Tous les deployments configurés pour Minikube"
echo ""

# Configurer le terminal pour utiliser le Docker de Minikube
echo "🐳 Configuration du Docker daemon de Minikube..."
eval $(minikube docker-env)

if docker info | grep -q "minikube"; then
    echo "✅ Docker configuré pour Minikube"
else
    echo "⚠️  Erreur de configuration Docker"
    exit 1
fi

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

# Vérifier les images disponibles dans Minikube
echo "📦 Images disponibles dans Minikube :"
docker images | grep -E "registration-service|inscription-service|proxy-service|config-service|registry-service|service-notes|authentification-service|frontend-service" | awk '{print "  - " $1":"$2 " (" $7 " " $8 ")"}'
echo ""

echo "🎯 Prochaines étapes :"
echo "  1. Buildez vos images dans Minikube :"
echo "     eval \$(minikube docker-env)  # Déjà fait ✓"
echo "     docker build -t registration-service:latest ./SmartSchool-backend/registration-service"
echo ""
echo "  2. Ou utilisez le script de build complet :"
echo "     ./deploy.sh"
echo ""
echo "  3. Pour revenir à Docker Hub :"
echo "     ./use-dockerhub.sh"
echo ""
echo "💡 Pour désactiver le Docker de Minikube dans ce terminal :"
echo "   eval \$(minikube docker-env -u)"
echo ""