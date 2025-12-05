#!/bin/sh

# Arrêter le script en cas d'erreur
set -e
echo "➡️ Running makemigrations app_auth..."
python manage.py makemigrations app_auth

echo "➡️ Running migrate app_auth..."
python manage.py migrate app_auth

echo "➡️ Running makemigrations..."
python manage.py makemigrations

echo "➡️ Running migrate..."
python manage.py migrate

echo "➡️ Starting Django server..."
python manage.py runserver 0.0.0.0:8001 


