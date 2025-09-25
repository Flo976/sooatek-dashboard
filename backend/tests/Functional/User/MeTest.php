<?php

declare(strict_types=1);

namespace App\Tests\Functional\User;

use App\Tests\Functional\ApiTestCase;

class MeTest extends ApiTestCase
{
    public function testMeEndpointReturnsProfile(): void
    {
        self::fail('GET /api/v1/user/me contract not implemented yet.');
    }
}
