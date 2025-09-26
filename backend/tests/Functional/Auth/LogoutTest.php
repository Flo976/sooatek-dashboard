<?php

declare(strict_types=1);

namespace App\Tests\Functional\Auth;

use App\Entity\User;
use App\Repository\RefreshTokenRepository;
use App\Tests\Functional\ApiTestCase;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class LogoutTest extends ApiTestCase
{
    public function testLogoutRevokesRefreshToken(): void
    {
        /** @var UserPasswordHasherInterface $passwordHasher */
        $passwordHasher = self::getContainer()->get(UserPasswordHasherInterface::class);
        /** @var RefreshTokenRepository $refreshTokenRepository */
        $refreshTokenRepository = self::getContainer()->get(RefreshTokenRepository::class);

        $user = (new User())
            ->setEmail('logout@example.com')
            ->setFirstName('Logout')
            ->setLastName('User')
            ->setIsActive(true)
            ->setIsVerified(true);
        $user->setPassword($passwordHasher->hashPassword($user, 'LogoutP@ss123'));

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
                'email' => 'logout@example.com',
                'password' => 'LogoutP@ss123',
            ], JSON_THROW_ON_ERROR)
        );

        self::assertResponseStatusCodeSame(Response::HTTP_OK);
        $loginResponse = json_decode($client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR);

        $refreshToken = $loginResponse['refreshToken'];
        $accessToken = $loginResponse['accessToken'];

        $client->request(
            'POST',
            '/api/v1/auth/logout',
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_Authorization' => sprintf('Bearer %s', $accessToken),
            ],
            json_encode([
                'refreshToken' => $refreshToken,
            ], JSON_THROW_ON_ERROR)
        );

        self::assertResponseStatusCodeSame(Response::HTTP_NO_CONTENT);
        self::assertEmpty($client->getResponse()->getContent());

        $storedToken = $refreshTokenRepository->findOneBy(['token' => $refreshToken]);
        self::assertNotNull($storedToken);
        self::assertNotNull($storedToken->getRevokedAt(), 'Refresh token must be revoked on logout.');
    }
}
