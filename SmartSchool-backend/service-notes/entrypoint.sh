#!/bin/sh

# Arrêter le script en cas d'erreur
set -e

echo "➡️ Running makemigrations..."
python manage.py makemigrations

echo "➡️ Running migrate..."
python manage.py migrate

echo "➡️ Starting Django server..."
python manage.py runserver 0.0.0.0:8002 
