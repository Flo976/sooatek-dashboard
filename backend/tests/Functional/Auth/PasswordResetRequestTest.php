<?php

declare(strict_types=1);

namespace App\Tests\Functional\Auth;

use App\Tests\Functional\ApiTestCase;

class PasswordResetRequestTest extends ApiTestCase
{
    public function testPasswordResetRequestCreatesToken(): void
    {
        self::fail('POST /api/v1/auth/password-reset contract not implemented yet.');
    }
}
