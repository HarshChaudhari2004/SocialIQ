#!/bin/bash

# Exit the script as soon as any command fails
set -e

# Update package list and install dependencies
echo "Installing system dependencies..."
sudo apt-get update
sudo apt-get install -y python3-pip python3-dev libpq-dev

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
python manage.py runserver 0.0.0.0:8000
