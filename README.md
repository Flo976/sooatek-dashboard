# Sooatek Dashboard

Full-stack application with Symfony 7 backend API and Next.js 14 frontend.

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-username/sooatek-dashboard.git
cd sooatek-dashboard

# Start all services
sudo docker-compose up -d

# Initialize backend (first time only)
sudo docker-compose exec backend bin/init.sh

# Access the applications
# Frontend: http://localhost:3000
# Backend API: http://localhost:8001
# MySQL: localhost:3307
# Redis: localhost:6379
```

### Local Installation

See detailed instructions in:
- [Backend README](./backend/README.md) - Symfony API setup
- [Frontend README](./frontend/README.md) - Next.js app setup

## 📋 Prerequisites

### For Docker Setup
- Docker & Docker Compose
- Git

### For Local Setup
- **PHP 8.2+** with extensions (ctype, iconv)
- **Composer**
- **Node.js 18+** (recommended: v20 LTS)
- **MySQL 8.0**
- **Redis 7**

## 🏗️ Project Structure

```
sooatek-dashboard/
├── backend/          # Symfony 7 API (PHP 8.2+)
│   ├── src/         # Application source code
│   ├── config/      # Configuration files
│   └── tests/       # Backend tests
├── frontend/        # Next.js 14 App (TypeScript)
│   ├── src/         # Application source code
│   ├── public/      # Static assets
│   └── components/  # React components
├── specs/           # Project specifications
└── docker-compose.yml
```

## 🛠️ Tech Stack

### Backend
- **Symfony 7** - PHP framework
- **API Platform 3.x** - REST API framework
- **Doctrine ORM** - Database abstraction
- **JWT Authentication** - Secure authentication
- **MySQL 8.0** - Primary database
- **Redis 7** - Caching & sessions

### Frontend
- **Next.js 14** - React framework
- **TypeScript 5.x** - Type safety
- **React 18** - UI library
- **shadcn/ui** - Component library
- **Tailwind CSS** - Styling
- **React Hook Form** - Form management
- **Zod** - Schema validation

## 📝 Available Commands

### Backend Commands
```bash
# Run tests
cd backend && composer test

# Code analysis
cd backend && composer phpstan

# Fix code style
cd backend && composer php-cs-fixer
```

### Frontend Commands
```bash
# Development
cd frontend && npm run dev

# Build
cd frontend && npm run build

# Tests
cd frontend && npm test

# Linting
cd frontend && npm run lint

# Type checking
cd frontend && npm run type-check
```

### Docker Commands
```bash
# Start all services
sudo docker-compose up -d

# Initialize backend (first time or after rebuild)
sudo docker-compose exec backend bin/init.sh

# Stop all services
sudo docker-compose down

# View logs
sudo docker-compose logs -f [service-name]

# Rebuild services
sudo docker-compose build --no-cache

# Access container shell
sudo docker-compose exec backend bash
sudo docker-compose exec frontend sh
```

## 🔧 Configuration

### Environment Variables

Backend (`.env.local`):
```bash
DATABASE_URL=mysql://user:password@localhost:3307/sooatekapp
REDIS_URL=redis://localhost:6379
JWT_PASSPHRASE=your-passphrase
```

Frontend (`.env.local`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:8001/api/v1
NEXTAUTH_SECRET=your-secret-key
```

## 🧪 Testing

```bash
# Backend tests
cd backend && composer test

# Frontend tests
cd frontend && npm test

# Run all tests with Docker
sudo docker-compose exec backend composer test
sudo docker-compose exec frontend npm test
```

## 📚 Documentation

- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)
- [API Documentation](http://localhost:8001/api) (when running)

## 🐛 Troubleshooting

### Docker Issues
```bash
# Reset everything
sudo docker-compose down -v
sudo docker-compose up -d --build

# Initialize backend after rebuild
sudo docker-compose exec backend bin/init.sh

# Check service status
sudo docker-compose ps

# View service logs
sudo docker-compose logs [service-name]
```

### Port Conflicts
- Frontend (3000): `lsof -ti:3000 | xargs kill -9`
- Backend (8001): `lsof -ti:8001 | xargs kill -9`
- MySQL (3307): `lsof -ti:3307 | xargs kill -9`
- Redis (6379): `lsof -ti:6379 | xargs kill -9`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

Proprietary - All rights reserved

## 👥 Team

Sooatek Development Team

---

For detailed setup instructions, see:
- [Backend Setup Guide](./backend/README.md)
- [Frontend Setup Guide](./frontend/README.md)