<?php

declare(strict_types=1);

namespace App\Tests\Functional;

class DashboardTest extends ApiTestCase
{
    public function testDashboardRequiresAuthentication(): void
    {
        self::fail('GET /api/v1/dashboard contract not implemented yet.');
    }
}
