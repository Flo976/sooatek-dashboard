<?php

declare(strict_types=1);

namespace App\Tests\Functional\Auth;

use App\Entity\User;
use App\Repository\RefreshTokenRepository;
use App\Tests\Functional\ApiTestCase;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class LoginTest extends ApiTestCase
{
    public function testLoginReturnsTokens(): void
    {
        /** @var UserPasswordHasherInterface $passwordHasher */
        $passwordHasher = self::getContainer()->get(UserPasswordHasherInterface::class);

        $user = (new User())
            ->setEmail('test@example.com')
            ->setFirstName('Test')
            ->setLastName('User')
            ->setIsActive(true)
            ->setIsVerified(true);
        $user->setPassword($passwordHasher->hashPassword($user, 'TestP@ss123'));

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
                'email' => 'test@example.com',
                'password' => 'TestP@ss123',
            ], JSON_THROW_ON_ERROR)
        );

        self::assertResponseStatusCodeSame(Response::HTTP_OK);

        $responseData = json_decode($client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR);

        self::assertArrayHasKey('accessToken', $responseData);
        self::assertArrayHasKey('refreshToken', $responseData);
        self::assertArrayHasKey('expiresIn', $responseData);
        self::assertSame('Bearer', $responseData['tokenType']);
        self::assertSame('test@example.com', $responseData['user']['email']);

        /** @var RefreshTokenRepository $refreshTokenRepository */
        $refreshTokenRepository = self::getContainer()->get(RefreshTokenRepository::class);
        self::assertNotNull($refreshTokenRepository->findOneBy(['token' => $responseData['refreshToken']]));
    }
}
