<?php

declare(strict_types=1);

namespace App\Tests\Functional\Auth;

use App\Tests\Functional\ApiTestCase;

class LogoutTest extends ApiTestCase
{
    public function testLogoutRevokesRefreshToken(): void
    {
        self::fail('POST /api/v1/auth/logout contract not implemented yet.');
    }
}
