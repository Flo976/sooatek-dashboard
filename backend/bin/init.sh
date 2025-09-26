#!/bin/bash

# Backend initialization script
set -e

echo "🚀 Initializing Sooatek Backend..."

# Install dependencies
echo "📦 Installing dependencies..."
composer install --no-interaction

# Wait for database to be ready
echo "⏳ Waiting for database..."
until php bin/console dbal:run-sql "SELECT 1" > /dev/null 2>&1; do
    echo "Waiting for database connection..."
    sleep 2
done

# Create database if it doesn't exist
echo "🗄️ Setting up database..."
php bin/console doctrine:database:create --if-not-exists

# Run migrations
echo "📝 Running migrations..."
php bin/console doctrine:migrations:migrate --no-interaction

# Generate JWT keys if they don't exist
if [ ! -f config/jwt/private.pem ]; then
    echo "🔑 Generating JWT keys..."
    mkdir -p config/jwt

    # Generate JWT keypair
    php bin/console lexik:jwt:generate-keypair --overwrite
fi

# Clear cache
echo "🧹 Clearing cache..."
php bin/console cache:clear

echo "✅ Backend initialization complete!"
echo "📍 API available at http://localhost:8001"
echo "📚 API documentation at http://localhost:8001/api"