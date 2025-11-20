#!/bin/bash

# =================================================
# SmartSchool - Install all dependencies script
# =================================================

echo "🚀 Starting dependency installation for SmartSchool project..."

# ----------------------------
# 0️⃣ Set Python executable
# ----------------------------
PYTHON_BIN=$(which python3 || which python)
if [ -z "$PYTHON_BIN" ]; then
    echo "❌ Python is not installed."
    exit 1
fi

# ----------------------------
# 1️⃣ Backend Django services
# ----------------------------
DJANGO_SERVICES=("service-notes" "Systeme_Authentification")

for service in "${DJANGO_SERVICES[@]}"; do
    SERVICE_PATH="./SmartSchool-backend/$service"
    echo "📦 Setting up Python environment for $service..."
    
    if [ ! -d "$SERVICE_PATH/venv" ]; then
        $PYTHON_BIN -m venv "$SERVICE_PATH/venv"
        echo "🟢 Virtual environment created for $service."
    fi

    # Activate virtual environment
    source "$SERVICE_PATH/venv/bin/activate"

    # Install requirements
    if [ -f "$SERVICE_PATH/requirements.txt" ]; then
        pip install --upgrade pip
        pip install -r "$SERVICE_PATH/requirements.txt"
        echo "✅ Dependencies installed for $service."
    else
        echo "⚠️  requirements.txt not found in $service"
    fi

    # Deactivate environment
    deactivate
done

# ----------------------------
# 2️⃣ Spring Boot services (SmartSchool-config)
# ----------------------------
SPRING_SERVICES_PATH="./SmartSchool-config"
if [ -d "$SPRING_SERVICES_PATH" ]; then
    echo "📦 Building and running Spring Boot services..."
    cd "$SPRING_SERVICES_PATH" || exit
    # Build all Spring Boot projects
    for dir in */ ; do
        if [ -f "$dir/pom.xml" ]; then
            echo "⚙️  Building Spring Boot service $dir..."
            mvn clean install -DskipTests
            echo "✅ $dir built successfully."
        fi
    done
    cd ..
else
    echo "⚠️  SmartSchool-config folder not found."
fi

# ----------------------------
# 3️⃣ Backend Express.js services
# ----------------------------
EXPRESS_SERVICES=("inscription-service" "registration-service")

for service in "${EXPRESS_SERVICES[@]}"; do
    SERVICE_PATH="./SmartSchool-backend/$service"
    echo "📦 Installing Node.js dependencies for $service..."
    
    if [ -f "$SERVICE_PATH/package.json" ]; then
        cd "$SERVICE_PATH" || exit
        npm install
        cd ../../
        echo "✅ Dependencies installed for $service."
    else
        echo "⚠️  package.json not found in $service"
    fi
done

# ----------------------------
# 4️⃣ Frontend React.js
# ----------------------------
FRONTEND_PATH="./SmartSchool-front"
echo "📦 Installing dependencies for frontend (SmartSchool-front)..."
if [ -f "$FRONTEND_PATH/package.json" ]; then
    cd "$FRONTEND_PATH" || exit
    npm install
    cd ..
    echo "✅ Frontend dependencies installed."
else
    echo "⚠️  package.json not found in SmartSchool-front"
fi

echo "🎉 All dependencies installed and Spring Boot services built successfully!"
