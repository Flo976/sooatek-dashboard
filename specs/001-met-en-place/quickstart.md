# Quickstart Guide: Authentication and Dashboard

## Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ and npm/yarn installed
- Git installed
- Minimum 4GB RAM available

## Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/sooatek/sooatekapp.git
cd sooatekapp
```

### 2. Environment Configuration

#### Backend (.env)
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration:
# - DATABASE_URL=mysql://user:password@database:3306/sooatekapp
# - JWT_SECRET_KEY=/path/to/private.key
# - JWT_PUBLIC_KEY=/path/to/public.key
# - JWT_PASSPHRASE=your-passphrase
```

#### Frontend (.env.local)
```bash
cd ../frontend
cp .env.example .env.local
# Edit .env.local:
# - NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
# - NEXTAUTH_SECRET=generate-secret-key
# - NEXTAUTH_URL=http://localhost:3000
```

### 3. Generate JWT Keys

```bash
cd backend
mkdir -p config/jwt
openssl genpkey -algorithm RSA -out config/jwt/private.pem -pkeyopt rsa_keygen_bits:4096
openssl rsa -pubout -in config/jwt/private.pem -out config/jwt/public.pem
```

### 4. Start Services with Docker

```bash
# From project root
docker-compose up -d

# Verify services are running
docker-compose ps
# Should show: database, redis, backend, frontend
```

### 5. Initialize Database

```bash
# Run migrations
docker-compose exec backend php bin/console doctrine:migrations:migrate

# Load fixtures (development only)
docker-compose exec backend php bin/console doctrine:fixtures:load
```

### 6. Install Dependencies

```bash
# Backend
docker-compose exec backend composer install

# Frontend (if running locally)
cd frontend
npm install
```

### 7. Verify Installation

Open http://localhost:3000 in your browser. You should see the login page.

## Test User Credentials

After loading fixtures, you can use:
- Email: `test@example.com`
- Password: `TestP@ss123`

## Testing User Flows

### 1. User Registration

1. Navigate to http://localhost:3000/register
2. Fill in the registration form:
   - Email: your-email@example.com
   - Password: YourP@ss123 (8+ chars, mixed case, number, special char)
   - Confirm Password: YourP@ss123
   - First Name: Your Name
   - Last Name: Your Surname
3. Click "Register"
4. You should be redirected to login page with success message

### 2. User Login

1. Navigate to http://localhost:3000/login
2. Enter credentials:
   - Email: test@example.com
   - Password: TestP@ss123
3. Click "Login"
4. You should be redirected to dashboard at http://localhost:3000/dashboard

### 3. Dashboard Access

1. After successful login, you're on the dashboard
2. Verify you see:
   - Welcome message with your name
   - Logout button
   - Basic dashboard layout with shadcn components
3. Refresh the page - you should remain authenticated

### 4. Session Timeout

1. Login successfully
2. Wait for 1 hour without activity
3. Try to navigate or refresh
4. You should be redirected to login page

### 5. Account Lockout

1. Go to login page
2. Enter incorrect password 5 times in succession
3. On the 6th attempt, you should see "Account locked" message
4. Wait 30 minutes or use admin panel to unlock

### 6. Password Reset

1. On login page, click "Forgot Password?"
2. Enter your email address
3. Click "Send Reset Link"
4. Check email for reset link (in development, check Mailcatcher at http://localhost:1080)
5. Click the link in email
6. Enter new password twice
7. Click "Reset Password"
8. Login with new password

### 7. Logout

1. While logged in, click "Logout" button
2. You should be redirected to login page
3. Try to access http://localhost:3000/dashboard directly
4. You should be redirected to login

## API Testing with cURL

### Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestP@ss123"}'
```

### Access Protected Route
```bash
# Use the accessToken from login response
curl -X GET http://localhost:8000/api/v1/dashboard \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Refresh Token
```bash
curl -X POST http://localhost:8000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

## Troubleshooting

### Backend Issues

```bash
# Check logs
docker-compose logs backend

# Clear cache
docker-compose exec backend php bin/console cache:clear

# Verify database connection
docker-compose exec backend php bin/console doctrine:schema:validate
```

### Frontend Issues

```bash
# Check logs
docker-compose logs frontend

# Clear Next.js cache
rm -rf frontend/.next
cd frontend && npm run build
```

### Database Issues

```bash
# Access MySQL
docker-compose exec database mysql -u root -p

# Check tables
SHOW TABLES;
SELECT * FROM users LIMIT 1;
```

## Development Commands

### Backend
```bash
# Run tests
docker-compose exec backend php bin/phpunit

# Check code style
docker-compose exec backend vendor/bin/php-cs-fixer fix --dry-run

# Static analysis
docker-compose exec backend vendor/bin/phpstan analyse
```

### Frontend
```bash
# Run tests
cd frontend && npm test

# Lint code
cd frontend && npm run lint

# Type check
cd frontend && npm run type-check
```

## Rate Limiting Verification

1. Try to login with wrong password 6 times rapidly
2. You should get HTTP 429 "Too Many Requests" after 5th attempt
3. Check the Retry-After header for wait time

## Security Checklist

- [ ] JWT keys are properly generated and secured
- [ ] HTTPS enabled in production
- [ ] CORS configured for your domain only
- [ ] Rate limiting active on auth endpoints
- [ ] Password complexity enforced
- [ ] Account lockout after 5 failed attempts
- [ ] Session timeout after 1 hour
- [ ] Refresh tokens rotate on use
- [ ] Audit logs recording auth events

## Next Steps

1. Configure email service for production
2. Set up monitoring and alerting
3. Configure backup strategy for database
4. Review and adjust rate limiting values
5. Set up CI/CD pipeline
6. Perform security audit before production deployment