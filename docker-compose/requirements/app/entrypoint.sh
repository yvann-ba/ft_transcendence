#!/bin/sh

if [ "$DATABASE" = "postgres" ]
then
  echo "Waiting for postgres..."

  while ! nc -z $DB_HOST $DB_PORT; do
    sleep 0.1
  done

  echo "PostgreSQL started"
fi

echo "Apply database migrations"
python manage.py migrate

echo "Collect static files"
mkdir -p /app/staticfiles
python manage.py collectstatic --noinput

echo "Starting server"
exec "$@"
