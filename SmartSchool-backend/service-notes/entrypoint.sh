#!/bin/sh
set -e

python manage.py migrate --noinput
python manage.py collectstatic --noinput

exec gunicorn Notes_service.wsgi:application --bind 0.0.0.0:${PORT:-8001}

