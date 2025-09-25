<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

abstract class ApiTestCase extends WebTestCase
{
    protected function createAuthenticatedClient(?string $token = null): KernelBrowser
    {
        $client = static::createClient();
        if ($token) {
            $client->setServerParameter('HTTP_Authorization', sprintf('Bearer %s', $token));
        }

        return $client;
    }
}
