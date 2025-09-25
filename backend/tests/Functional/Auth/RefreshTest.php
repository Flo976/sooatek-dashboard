<?php

declare(strict_types=1);

namespace App\Tests\Functional\Auth;

use App\Tests\Functional\ApiTestCase;

class RefreshTest extends ApiTestCase
{
    public function testRefreshReturnsNewAccessToken(): void
    {
        self::fail('POST /api/v1/auth/refresh contract not implemented yet.');
    }
}
