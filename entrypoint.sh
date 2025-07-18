#!/bin/sh

echo "⏳ Waiting for PostgreSQL to be ready..."
/usr/local/bin/wait-for-it.sh db:5432 --timeout=30 --strict -- echo "✅ Database is up!"

echo "📦 Collecting static files..."
uv run manage.py collectstatic --noinput

echo "🌐 Starting Django server..."
uv run manage.py runserver 0.0.0.0:8000