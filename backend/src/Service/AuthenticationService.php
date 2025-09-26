<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\AuditLog;
use App\Entity\RefreshToken;
use App\Entity\User;
use App\Exception\AccountLockedException;
use App\Exception\AuthenticationException;
use App\Exception\InvalidRefreshTokenException;
use App\Exception\RegistrationException;
use App\Repository\RefreshTokenRepository;
use App\Repository\UserRepository;
use DateInterval;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Validator\ConstraintViolationInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class AuthenticationService
{
    private const PASSWORD_PATTERN = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^\\da-zA-Z]).{8,}$/';
    private const LOCK_INTERVAL_SPEC = '+30 minutes';

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly UserRepository $userRepository,
        private readonly RefreshTokenRepository $refreshTokenRepository,
        private readonly ValidatorInterface $validator,
        private readonly JWTTokenManagerInterface $jwtTokenManager,
        #[Autowire('%app.jwt_ttl%')] private readonly int $accessTokenTtl,
        #[Autowire('%app.jwt_refresh_ttl%')] private readonly int $refreshTokenTtl,
        #[Autowire('%app.rate_limit_login_attempts%')] private readonly int $maxLoginAttempts,
    ) {
    }

    /**
     * @return array{accessToken: string, refreshToken: string, expiresIn: int, user: array{id: string, email: string, firstName: ?string, lastName: ?string}}
     */
    public function authenticate(string $email, string $password, string $ipAddress, ?string $userAgent = null): array
    {
        $email = mb_strtolower(trim($email));
        $password = trim($password);

        if ($email === '' || $password === '') {
            throw new AuthenticationException('Email and password are required to login.', 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new AuthenticationException('A valid email address is required.', 400);
        }

        $now = new DateTimeImmutable();
        $user = $this->userRepository->findActiveByEmail($email);

        if ($user === null) {
            $this->logAudit(null, AuditLog::ACTION_LOGIN_FAILURE, $ipAddress, $userAgent, ['email' => $email]);

            throw new AuthenticationException();
        }

        if ($this->isAccountLocked($user, $now)) {
            $lockedUntil = $user->getLockedUntil();
            $metadata = [];
            if ($lockedUntil !== null) {
                $metadata['lockedUntil'] = $lockedUntil->format(DATE_ATOM);
            }
            $this->logAudit($user, AuditLog::ACTION_LOGIN_FAILURE, $ipAddress, $userAgent, $metadata);

            throw new AccountLockedException(sprintf('Account locked until %s.', $lockedUntil?->format(DATE_ATOM) ?? 'further notice'));
        }

        if (!$this->passwordHasher->isPasswordValid($user, $password)) {
            $this->handleFailedLogin($user, $now, $ipAddress, $userAgent);

            throw new AuthenticationException();
        }

        $user
            ->resetFailedLoginAttempts()
            ->setLockedUntil(null)
            ->setLastLoginAt($now)
            ->touch();

        $accessToken = $this->jwtTokenManager->create($user);
        $refreshToken = $this->createRefreshToken($user, $now);

        $this->logAudit($user, AuditLog::ACTION_LOGIN_SUCCESS, $ipAddress, $userAgent);

        $this->entityManager->flush();

        return [
            'accessToken' => $accessToken,
            'refreshToken' => $refreshToken->getToken(),
            'expiresIn' => $this->accessTokenTtl,
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
            ],
        ];
    }

    /**
     * @return array{id: string, email: string, firstName: ?string, lastName: ?string, isVerified: bool}
     */
    public function register(array $payload, string $ipAddress, ?string $userAgent = null): array
    {
        $email = mb_strtolower(trim((string) ($payload['email'] ?? '')));
        $password = (string) ($payload['password'] ?? '');
        $passwordConfirmation = (string) ($payload['passwordConfirmation'] ?? '');
        $firstName = $this->normaliseNullableString($payload['firstName'] ?? null);
        $lastName = $this->normaliseNullableString($payload['lastName'] ?? null);

        if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new RegistrationException('A valid email address is required.');
        }

        if (!preg_match(self::PASSWORD_PATTERN, $password)) {
            throw new RegistrationException('Password must be at least 8 characters and include uppercase, lowercase, numeric, and special characters.');
        }

        if (!hash_equals($password, $passwordConfirmation)) {
            throw new RegistrationException('Passwords do not match.');
        }

        if ($this->userRepository->findOneBy(['email' => $email]) !== null) {
            throw new RegistrationException('An account already exists with this email address.', 409);
        }

        $user = new User();
        $user
            ->setEmail($email)
            ->setFirstName($firstName)
            ->setLastName($lastName)
            ->setIsActive(true)
            ->setIsVerified(false)
            ->resetFailedLoginAttempts()
            ->setLockedUntil(null)
            ->touch();

        $hashedPassword = $this->passwordHasher->hashPassword($user, $password);
        $user->setPassword($hashedPassword);

        $violations = $this->validator->validate($user);
        if (count($violations) > 0) {
            $message = $this->firstViolationMessage($violations);
            throw new RegistrationException($message);
        }

        $this->entityManager->persist($user);
        $this->logAudit($user, AuditLog::ACTION_REGISTER, $ipAddress, $userAgent);
        $this->entityManager->flush();

        return [
            'id' => (string) $user->getId(),
            'email' => $user->getEmail(),
            'firstName' => $user->getFirstName(),
            'lastName' => $user->getLastName(),
            'isVerified' => $user->isVerified(),
        ];
    }

    /**
     * @return array{accessToken: string, refreshToken: string, expiresIn: int}
     */
    public function refresh(string $refreshToken, string $ipAddress, ?string $userAgent = null): array
    {
        $refreshToken = trim($refreshToken);
        if ($refreshToken === '') {
            throw new InvalidRefreshTokenException('Refresh token is required.');
        }

        $storedToken = $this->refreshTokenRepository->findOneBy(['token' => $refreshToken]);
        $now = new DateTimeImmutable();

        if ($storedToken === null || $storedToken->getRevokedAt() !== null || $storedToken->getExpiresAt() <= $now) {
            throw new InvalidRefreshTokenException();
        }

        $user = $storedToken->getUser();
        if (!$user->isActive()) {
            throw new AuthenticationException('User account is inactive.', 403);
        }

        $storedToken->revoke($now);
        $newRefreshToken = $this->createRefreshToken($user, $now, $storedToken->getFamily());

        $accessToken = $this->jwtTokenManager->create($user);
        $this->logAudit($user, AuditLog::ACTION_TOKEN_REFRESH, $ipAddress, $userAgent, [
            'family' => $newRefreshToken->getFamily(),
        ]);

        $this->entityManager->flush();

        return [
            'accessToken' => $accessToken,
            'refreshToken' => $newRefreshToken->getToken(),
            'expiresIn' => $this->accessTokenTtl,
        ];
    }

    public function logout(User $user, string $refreshToken, string $ipAddress, ?string $userAgent = null): void
    {
        $refreshToken = trim($refreshToken);
        if ($refreshToken === '') {
            throw new InvalidRefreshTokenException('Refresh token is required.');
        }

        $storedToken = $this->refreshTokenRepository->findOneBy(['token' => $refreshToken]);
        $now = new DateTimeImmutable();

        if ($storedToken === null || $storedToken->getUser()->getId()->toRfc4122() !== $user->getId()->toRfc4122()) {
            throw new InvalidRefreshTokenException();
        }

        if ($storedToken->getRevokedAt() === null) {
            $storedToken->revoke($now);
        }

        $this->logAudit($user, AuditLog::ACTION_LOGOUT, $ipAddress, $userAgent, [
            'family' => $storedToken->getFamily(),
        ]);

        $this->entityManager->flush();
    }

    private function handleFailedLogin(User $user, DateTimeImmutable $now, string $ipAddress, ?string $userAgent = null): void
    {
        $user->incrementFailedLoginAttempts()->touch();

        if ($user->getFailedLoginAttempts() >= $this->maxLoginAttempts) {
            $user->setLockedUntil($now->modify(self::LOCK_INTERVAL_SPEC));
        }

        $metadata = [
            'failedAttempts' => $user->getFailedLoginAttempts(),
        ];

        if ($user->getLockedUntil() !== null) {
            $metadata['lockedUntil'] = $user->getLockedUntil()->format(DATE_ATOM);
        }

        $this->logAudit($user, AuditLog::ACTION_LOGIN_FAILURE, $ipAddress, $userAgent, $metadata);
        $this->entityManager->flush();
    }

    private function isAccountLocked(User $user, DateTimeImmutable $now): bool
    {
        $lockedUntil = $user->getLockedUntil();
        if ($lockedUntil === null) {
            return false;
        }

        if ($lockedUntil <= $now) {
            $user->setLockedUntil(null);
            $this->entityManager->persist($user);

            return false;
        }

        return true;
    }

    private function createRefreshToken(User $user, DateTimeImmutable $now, ?string $family = null): RefreshToken
    {
        $refreshToken = new RefreshToken();
        $refreshToken
            ->setUser($user)
            ->setToken(bin2hex(random_bytes(64)))
            ->setFamily($family ?? Uuid::v4()->toRfc4122())
            ->setExpiresAt($now->add(new DateInterval(sprintf('PT%dS', $this->refreshTokenTtl))))
            ->setCreatedAt($now);

        $this->entityManager->persist($refreshToken);

        return $refreshToken;
    }

    private function logAudit(?User $user, string $action, string $ipAddress, ?string $userAgent, array $metadata = []): void
    {
        $auditLog = new AuditLog();
        $auditLog
            ->setUser($user)
            ->setAction($action)
            ->setIpAddress($ipAddress)
            ->setUserAgent($userAgent)
            ->setMetadata($metadata === [] ? null : $metadata);

        $this->entityManager->persist($auditLog);
    }

    /**
     * @param iterable<ConstraintViolationInterface> $violations
     */
    private function firstViolationMessage(iterable $violations): string
    {
        foreach ($violations as $violation) {
            return $violation->getPropertyPath() !== ''
                ? sprintf('%s: %s', $violation->getPropertyPath(), $violation->getMessage())
                : $violation->getMessage();
        }

        return 'Invalid data provided.';
    }

    private function normaliseNullableString(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $value = trim($value);

        return $value === '' ? null : $value;
    }
}
