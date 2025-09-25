<?php

declare(strict_types=1);

namespace App\Tests\Functional\Auth;

use App\Tests\Functional\ApiTestCase;

class PasswordResetConfirmTest extends ApiTestCase
{
    public function testPasswordResetConfirmUpdatesPassword(): void
    {
        self::fail('POST /api/v1/auth/password-reset/confirm contract not implemented yet.');
    }
}
