<?php

declare(strict_types=1);

namespace App\Tests\Functional\Auth;

use App\Tests\Functional\ApiTestCase;

class LoginTest extends ApiTestCase
{
    public function testLoginReturnsTokens(): void
    {
        self::fail('POST /api/v1/auth/login contract not implemented yet.');
    }
}
