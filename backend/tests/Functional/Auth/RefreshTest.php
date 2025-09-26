<?php

declare(strict_types=1);

namespace App\Tests\Functional\Auth;

use App\Entity\User;
use App\Repository\RefreshTokenRepository;
use App\Tests\Functional\ApiTestCase;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class RefreshTest extends ApiTestCase
{
    public function testRefreshRotatesTokens(): void
    {
        /** @var UserPasswordHasherInterface $passwordHasher */
        $passwordHasher = self::getContainer()->get(UserPasswordHasherInterface::class);
        /** @var RefreshTokenRepository $refreshTokenRepository */
        $refreshTokenRepository = self::getContainer()->get(RefreshTokenRepository::class);

        $user = (new User())
            ->setEmail('refresh@example.com')
            ->setFirstName('Refresh')
            ->setLastName('User')
            ->setIsActive(true)
            ->setIsVerified(true);
        $user->setPassword($passwordHasher->hashPassword($user, 'RefreshP@ss123'));

        $this->entityManager?->persist($user);
        $this->entityManager?->flush();

        $client = static::createClient();
        $client->request(
            'POST',
            '/api/v1/auth/login',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => 'refresh@example.com',
                'password' => 'RefreshP@ss123',
            ], JSON_THROW_ON_ERROR)
        );

        self::assertResponseStatusCodeSame(Response::HTTP_OK);
        $loginResponse = json_decode($client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR);
        $oldRefreshToken = $loginResponse['refreshToken'];
        $oldToken = $refreshTokenRepository->findOneBy(['token' => $oldRefreshToken]);
        self::assertNotNull($oldToken, 'Refresh token should be stored after login.');

        $client->request(
            'POST',
            '/api/v1/auth/refresh',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'refreshToken' => $oldRefreshToken,
            ], JSON_THROW_ON_ERROR)
        );

        self::assertResponseStatusCodeSame(Response::HTTP_OK);
        $refreshResponse = json_decode($client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertArrayHasKey('accessToken', $refreshResponse);
        self::assertArrayHasKey('refreshToken', $refreshResponse);
        self::assertArrayHasKey('expiresIn', $refreshResponse);
        self::assertNotSame($oldRefreshToken, $refreshResponse['refreshToken']);

        $this->entityManager?->refresh($oldToken);
        self::assertNotNull($oldToken->getRevokedAt(), 'Old refresh token should be revoked after rotation.');

        $newToken = $refreshTokenRepository->findOneBy(['token' => $refreshResponse['refreshToken']]);
        self::assertNotNull($newToken, 'New refresh token should be persisted.');
        self::assertNull($newToken->getRevokedAt());
    }
}
