#!/bin/bash
set -e

echo "==> [CampusConnect] Starting Vercel build process..."

# Install python dependencies
echo "==> [CampusConnect] Installing dependencies from requirements.txt..."
python3 -m pip install -r requirements.txt

# Run migrations if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
    echo "==> [CampusConnect] Running database migrations..."
    python3 manage.py migrate --noinput
    echo "==> [CampusConnect] Populating initial seed data..."
    python3 manage.py seed_data || true
fi

# Collect static files into staticfiles/
echo "==> [CampusConnect] Collecting static assets..."
python3 manage.py collectstatic --noinput --clear

echo "==> [CampusConnect] Build completed successfully!"
