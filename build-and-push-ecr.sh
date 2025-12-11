#!/bin/bash
set -e

# ===================================
# Configuration
# ===================================
AWS_REGION="${AWS_REGION:-eu-west-1}"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
IMAGE_TAG="${1:-latest}"

# Versions des images officielles
RABBITMQ_VERSION="${RABBITMQ_VERSION:-3.12-management}"
POSTGRES_VERSION="${POSTGRES_VERSION:-15-alpine}"

echo "=============================================="
echo "🐳 BUILD & PUSH vers Amazon ECR"
echo "Registry: $ECR_REGISTRY"
echo "Tag: $IMAGE_TAG"
echo "=============================================="

# Login à ECR
echo "🔐 Connexion à ECR..."
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $ECR_REGISTRY

# ===================================
# Liste des services
# ===================================
declare -A IMAGES=(
    # ["smartschool/config-service"]="./smartSchool-config/config-service"
    # ["smartschool/registry-service"]="./smartSchool-config/registry-service"
    # ["smartschool/proxy-service"]="./smartSchool-config/proxy-service"
    # ["smartschool/registration-service"]="./SmartSchool-backend/registration-service"
    # ["smartschool/inscription-service"]="./SmartSchool-backend/inscription-service"
    # ["smartschool/service-notes"]="./SmartSchool-backend/service-notes"
    # ["smartschool/authentification-service"]="./SmartSchool-backend/systeme_authentification"
    # ["smartschool/frontend-service"]="./SmartSchool-front"
)

# ===================================
# Build et Push des services custom
# ===================================
for repo in "${!IMAGES[@]}"; do
    context="${IMAGES[$repo]}"
    image_uri="$ECR_REGISTRY/$repo:$IMAGE_TAG"
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📦 Repository: $repo"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [ ! -d "$context" ]; then
        echo "❌ Dossier introuvable : $context"
        continue
    fi
    
    # Build
    echo "🔨 Build de $image_uri..."
    docker build -t "$image_uri" "$context"
    
    # Tag aussi en :latest
    if [ "$IMAGE_TAG" != "latest" ]; then
        docker tag "$image_uri" "$ECR_REGISTRY/$repo:latest"
    fi
    
    # Push
    echo "📤 Push vers ECR..."
    docker push "$image_uri"
    
    if [ "$IMAGE_TAG" != "latest" ]; then
        docker push "$ECR_REGISTRY/$repo:latest"
    fi
    
    echo "✅ Push réussi : $image_uri"
done

# ===================================
# Pull, Tag et Push des images officielles
# ===================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🐰 RabbitMQ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# RabbitMQ
echo "⬇️  Pull de rabbitmq:${RABBITMQ_VERSION}..."
docker pull rabbitmq:${RABBITMQ_VERSION}

echo "🏷️  Tag pour ECR..."
docker tag rabbitmq:${RABBITMQ_VERSION} \
    ${ECR_REGISTRY}/smartschool/rabbitmq:${RABBITMQ_VERSION}
docker tag rabbitmq:${RABBITMQ_VERSION} \
    ${ECR_REGISTRY}/smartschool/rabbitmq:latest

echo "📤 Push vers ECR..."
docker push ${ECR_REGISTRY}/smartschool/rabbitmq:${RABBITMQ_VERSION}
docker push ${ECR_REGISTRY}/smartschool/rabbitmq:latest

echo "✅ RabbitMQ push réussi"

# PostgreSQL
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🐘 PostgreSQL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "⬇️  Pull de postgres:${POSTGRES_VERSION}..."
docker pull postgres:${POSTGRES_VERSION}

echo "🏷️  Tag pour ECR..."
docker tag postgres:${POSTGRES_VERSION} \
    ${ECR_REGISTRY}/smartschool/postgres:${POSTGRES_VERSION}
docker tag postgres:${POSTGRES_VERSION} \
    ${ECR_REGISTRY}/smartschool/postgres:latest

echo "📤 Push vers ECR..."
docker push ${ECR_REGISTRY}/smartschool/postgres:${POSTGRES_VERSION}
docker push ${ECR_REGISTRY}/smartschool/postgres:latest

echo "✅ PostgreSQL push réussi"

# ===================================
# Résumé final
# ===================================
echo ""
echo "=============================================="
echo "🎉 Toutes les images sont sur ECR !"
echo "=============================================="
echo ""
echo "📋 Images disponibles:"
echo "   • ${#IMAGES[@]} services custom"
echo "   • RabbitMQ ${RABBITMQ_VERSION}"
echo "   • PostgreSQL ${POSTGRES_VERSION}"
echo ""
echo "🔍 Pour lister vos repos ECR:"
echo "   aws ecr describe-repositories --region $AWS_REGION"
echo "=============================================="