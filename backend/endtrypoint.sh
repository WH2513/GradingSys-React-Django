#!/bin/sh

python manage.py migrate --noinput
python manage.py collectstatic --noinput

# Start the server
gunicorn backend.wsgi:application --bind 0.0.0.0:8000