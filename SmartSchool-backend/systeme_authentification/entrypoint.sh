#!/bin/sh

# Start Django server in background
python manage.py runserver 0.0.0.0:8001 &

# Start consumer in foreground
python manage.py runconsumer
