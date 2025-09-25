<?php

declare(strict_types=1);

namespace App\Tests\Functional\Auth;

use App\Tests\Functional\ApiTestCase;

class RegisterTest extends ApiTestCase
{
    public function testRegisterCreatesUserAndReturnsSuccess(): void
    {
        self::fail('POST /api/v1/auth/register contract not implemented yet.');
    }
}
