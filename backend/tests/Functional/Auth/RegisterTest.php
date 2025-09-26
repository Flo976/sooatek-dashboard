<?php

declare(strict_types=1);

namespace App\Tests\Functional\Auth;

use App\Entity\User;
use App\Tests\Functional\ApiTestCase;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class RegisterTest extends ApiTestCase
{
    public function testRegisterCreatesUser(): void
    {
        $client = static::createClient();
        $payload = [
            'email' => 'new.user@example.com',
            'password' => 'Str0ngP@ss!',
            'passwordConfirmation' => 'Str0ngP@ss!',
            'firstName' => 'New',
            'lastName' => 'User',
        ];

        $client->request(
            'POST',
            '/api/v1/auth/register',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($payload, JSON_THROW_ON_ERROR)
        );

        self::assertResponseStatusCodeSame(Response::HTTP_CREATED);

        $responseData = json_decode($client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR);
        self::assertSame('new.user@example.com', $responseData['user']['email']);
        self::assertSame('New', $responseData['user']['firstName']);
        self::assertFalse($responseData['user']['isVerified']);

        /** @var User|null $user */
        $user = $this->entityManager?->getRepository(User::class)->findOneBy(['email' => 'new.user@example.com']);
        self::assertNotNull($user);
        self::assertSame('New', $user->getFirstName());
        self::assertSame('User', $user->getLastName());

        /** @var UserPasswordHasherInterface $passwordHasher */
        $passwordHasher = self::getContainer()->get(UserPasswordHasherInterface::class);
        self::assertTrue($passwordHasher->isPasswordValid($user, $payload['password']));
    }
}
