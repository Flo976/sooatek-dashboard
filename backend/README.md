# Sooatek Backend - Symfony 7 API

Backend API built with Symfony 7 and API Platform 3.x.

## Requirements

- PHP 8.2+
- Composer
- MySQL 8.0
- Redis 7
- PHP extensions: ctype, iconv

## Installation

### Option 1: Using Docker (Recommended)

```bash
# From project root
sudo docker-compose up -d

# Initialize backend (first time or after changes)
sudo docker-compose exec backend bin/init.sh
```

The API will be available at `http://localhost:8001`

### Option 2: Local Installation

1. Install dependencies:
```bash
composer install
```

2. Configure environment:
```bash
cp .env .env.local
# Edit .env.local with your database credentials
```

3. Set up database:
```bash
# Create database
php bin/console doctrine:database:create

# Run migrations
php bin/console doctrine:migrations:migrate
```

4. Generate JWT keys:
```bash
php bin/console lexik:jwt:generate-keypair --overwrite
```

5. Start development server:
```bash
symfony serve
# or
php -S localhost:8001 -t public
```

## Available Commands

```bash
# Run tests
composer test

# Run PHPStan static analysis
composer phpstan

# Fix code style
composer php-cs-fixer

# Clear cache
php bin/console cache:clear
```

## API Documentation

Once running, API documentation is available at:
- `http://localhost:8001/api` - API Platform documentation

## Project Structure

```
src/
├── Controller/     # API controllers
├── Entity/        # Doctrine entities
├── Repository/    # Database repositories
├── Security/      # Authentication & authorization
└── Service/       # Business logic services

config/
├── packages/      # Symfony packages configuration
├── routes/        # Routes configuration
└── jwt/          # JWT keys (generated)

tests/
├── Unit/         # Unit tests
└── Functional/   # Functional/Integration tests
```

## Environment Variables

Key environment variables in `.env`:

```bash
APP_ENV=dev
APP_SECRET=your-secret-key
DATABASE_URL=mysql://user:password@127.0.0.1:3307/sooatekapp
REDIS_URL=redis://localhost:6379
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=your-passphrase
```

## Testing

```bash
# Run all tests
composer test

# Run with coverage
php bin/phpunit --coverage-html coverage
```

## Code Quality

```bash
# Check code style
vendor/bin/php-cs-fixer fix --dry-run

# Fix code style
composer php-cs-fixer

# Run static analysis
composer phpstan
```

## Troubleshooting

### Clear cache
```bash
php bin/console cache:clear
rm -rf var/cache/*
```

### Database issues
```bash
# Reset database
php bin/console doctrine:database:drop --force
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate
```

### Permission issues
```bash
# Fix var directory permissions
sudo chown -R $USER:$USER var/
chmod -R 775 var/
```

### Using Docker (Recommended Setup)
```bash
# Complete setup with Docker
sudo docker-compose up -d
sudo docker-compose exec backend bin/init.sh

# Common Docker commands
sudo docker-compose exec backend php bin/console doctrine:migrations:status
sudo docker-compose exec backend php bin/console lexik:jwt:generate-keypair --overwrite
sudo docker-compose exec backend php bin/console cache:clear
```