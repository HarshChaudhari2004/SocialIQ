#!/bin/bash

# Exit the script as soon as any command fails
set -e


# Install Python dependencies from requirements.txt
echo "Installing Python dependencies..."
pip install --no-cache-dir -r requirements.txt

# Run database migrations (if needed)
echo "Applying database migrations..."
python manage.py migrate

# Collect static files (optional, if your project has static assets)
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start the Django development server (or use any other server if preferred)
echo "Starting Django development server..."

