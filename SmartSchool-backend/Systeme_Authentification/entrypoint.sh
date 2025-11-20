#!/bin/sh
set -e

python manage.py migrate --noinput

python manage.py runconsumer &
CONSUMER_PID=$!

cleanup() {
  kill "$CONSUMER_PID"
}

trap cleanup TERM INT

exec gunicorn authentication1.wsgi:application --bind 0.0.0.0:${PORT:-8001}

