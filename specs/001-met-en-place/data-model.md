# Data Model: Authentication and Dashboard Foundation

## Entities

### User
Represents an account holder with authentication credentials and profile information.

**Fields**:
- `id` (UUID): Primary key, unique identifier
- `email` (string, 255): Unique email address for authentication
- `password` (string, 255): Bcrypt hashed password
- `firstName` (string, 100, nullable): User's first name
- `lastName` (string, 100, nullable): User's last name
- `isActive` (boolean): Account active status (default: true)
- `isVerified` (boolean): Email verification status (default: false)
- `failedLoginAttempts` (integer): Counter for failed login attempts (default: 0)
- `lockedUntil` (datetime, nullable): Account lockout expiration time
- `lastLoginAt` (datetime, nullable): Timestamp of last successful login
- `createdAt` (datetime): Account creation timestamp
- `updatedAt` (datetime): Last modification timestamp

**Validation Rules**:
- Email must be valid format and unique
- Password must meet complexity requirements (8+ chars, mixed case, number, special)
- failedLoginAttempts reset to 0 on successful login
- lockedUntil set to now + 30 minutes when failedLoginAttempts reaches 5

**Relationships**:
- One-to-Many with RefreshToken
- One-to-Many with PasswordResetToken
- One-to-Many with AuditLog

### RefreshToken
Manages JWT refresh tokens for maintaining user sessions.

**Fields**:
- `id` (UUID): Primary key
- `userId` (UUID): Foreign key to User
- `token` (string, 512): Unique refresh token value
- `family` (string, 255): Token family for rotation tracking
- `expiresAt` (datetime): Token expiration time
- `revokedAt` (datetime, nullable): Revocation timestamp if invalidated
- `createdAt` (datetime): Token creation timestamp

**Validation Rules**:
- Token must be unique
- expiresAt set to createdAt + 7 days
- All tokens in same family revoked on refresh token reuse detection

**Relationships**:
- Many-to-One with User

### PasswordResetToken
Temporary tokens for password reset functionality.

**Fields**:
- `id` (UUID): Primary key
- `userId` (UUID): Foreign key to User
- `token` (string, 255): Unique reset token (hashed)
- `expiresAt` (datetime): Token expiration time
- `usedAt` (datetime, nullable): Usage timestamp
- `createdAt` (datetime): Token creation timestamp

**Validation Rules**:
- Token must be unique
- expiresAt set to createdAt + 1 hour
- Token invalidated after single use
- Maximum 3 active tokens per user

**Relationships**:
- Many-to-One with User

### AuditLog
Records security-relevant events for compliance and debugging.

**Fields**:
- `id` (UUID): Primary key
- `userId` (UUID, nullable): Foreign key to User (null for anonymous actions)
- `action` (string, 100): Action type (login_success, login_failure, password_reset, etc.)
- `ipAddress` (string, 45): Client IP address
- `userAgent` (string, 512, nullable): Client user agent string
- `metadata` (JSON, nullable): Additional context data
- `createdAt` (datetime): Event timestamp

**Validation Rules**:
- Action must be from predefined enum
- IP address must be valid IPv4 or IPv6

**Relationships**:
- Many-to-One with User (nullable)

## State Transitions

### User Account States
```
UNVERIFIED → ACTIVE (email verification)
ACTIVE → LOCKED (5 failed login attempts)
LOCKED → ACTIVE (lockout period expires or admin unlock)
ACTIVE → INACTIVE (admin deactivation)
INACTIVE → ACTIVE (admin reactivation)
```

### Session States
```
NO_SESSION → AUTHENTICATED (successful login)
AUTHENTICATED → REFRESHING (access token expired, using refresh token)
REFRESHING → AUTHENTICATED (new tokens issued)
AUTHENTICATED → EXPIRED (session timeout or logout)
```

### Password Reset Flow
```
REQUESTED → TOKEN_SENT (email with reset link sent)
TOKEN_SENT → RESET_COMPLETE (new password set)
TOKEN_SENT → EXPIRED (token not used within 1 hour)
```

## Database Indexes

### User
- Unique index on `email`
- Index on `isActive, email` (login queries)
- Index on `createdAt` (reporting)

### RefreshToken
- Unique index on `token`
- Index on `userId, expiresAt` (token validation)
- Index on `family` (rotation tracking)

### PasswordResetToken
- Unique index on `token`
- Index on `userId, expiresAt, usedAt` (token validation)

### AuditLog
- Index on `userId, createdAt` (user history)
- Index on `action, createdAt` (security monitoring)
- Index on `ipAddress, createdAt` (IP-based analysis)

## Data Retention Policies

### RefreshToken
- Expired tokens deleted after 30 days
- Revoked tokens deleted after 7 days

### PasswordResetToken
- All tokens deleted after 24 hours (used or expired)

### AuditLog
- Login events retained for 90 days
- Security events retained for 1 year
- Archived to cold storage after retention period

## Migration Considerations

### Initial Schema (V1)
```sql
-- Users table
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    failed_login_attempts INT DEFAULT 0,
    locked_until DATETIME NULL,
    last_login_at DATETIME NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    INDEX idx_user_email_active (is_active, email),
    INDEX idx_user_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- RefreshTokens table
CREATE TABLE refresh_tokens (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    token VARCHAR(512) UNIQUE NOT NULL,
    family VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    revoked_at DATETIME NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_refresh_user_expires (user_id, expires_at),
    INDEX idx_refresh_family (family)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PasswordResetTokens table
CREATE TABLE password_reset_tokens (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_reset_user_expires (user_id, expires_at, used_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AuditLogs table
CREATE TABLE audit_logs (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NULL,
    action VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent VARCHAR(512),
    metadata JSON,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_user_created (user_id, created_at),
    INDEX idx_audit_action_created (action, created_at),
    INDEX idx_audit_ip_created (ip_address, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```