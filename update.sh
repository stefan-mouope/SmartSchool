#!/bin/bash

DOCKER_USERNAME="votre-username"  # ⬅️ CHANGEZ ICI

# Remplacer dans tous les deployments
find k8s -name "deployment.yml" -type f -exec sed -i \
    -e "s|image: \(.*\):latest|image: $DOCKER_USERNAME/\1:latest|g" \
    -e "s|imagePullPolicy: Never|imagePullPolicy: Always|g" \
    {} \;

echo "✅ Tous les deployments ont été mis à jour pour utiliser Docker Hub"