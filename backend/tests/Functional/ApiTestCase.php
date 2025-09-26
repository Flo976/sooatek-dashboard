<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Kernel;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Tools\SchemaTool;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\Dotenv\Dotenv;
use Symfony\Component\HttpKernel\KernelInterface;

abstract class ApiTestCase extends WebTestCase
{
    protected ?EntityManagerInterface $entityManager = null;

    protected static function createKernel(array $options = []): KernelInterface
    {
        $projectDir = dirname(__DIR__, 2);

        if (!isset($_SERVER['APP_ENV']) && class_exists(Dotenv::class) && file_exists($projectDir . '/.env')) {
            (new Dotenv())->bootEnv($projectDir . '/.env');
        }

        $environment = $options['environment'] ?? 'test';
        $debug = (bool) ($options['debug'] ?? true);

        $_SERVER['APP_ENV'] = $environment;
        $_SERVER['APP_DEBUG'] = $debug ? '1' : '0';
        $_ENV['APP_ENV'] = $environment;
        $_ENV['APP_DEBUG'] = $debug ? '1' : '0';

        require_once $projectDir . '/src/Kernel.php';

        return new Kernel($environment, $debug);
    }

    protected function setUp(): void
    {
        parent::setUp();
        self::ensureKernelShutdown();

        $kernel = self::bootKernel();
        /** @var ManagerRegistry $registry */
        $registry = $kernel->getContainer()->get('doctrine');
        $this->entityManager = $registry->getManager();
        $metadata = $this->entityManager->getMetadataFactory()->getAllMetadata();

        if ($metadata !== []) {
            $schemaTool = new SchemaTool($this->entityManager);
            $schemaTool->dropSchema($metadata);
            $schemaTool->createSchema($metadata);
        }
    }

    protected function tearDown(): void
    {
        if ($this->entityManager !== null) {
            $this->entityManager->close();
            $this->entityManager = null;
        }

        parent::tearDown();
    }

    protected function createAuthenticatedClient(?string $token = null): KernelBrowser
    {
        $client = static::createClient();
        if ($token) {
            $client->setServerParameter('HTTP_Authorization', sprintf('Bearer %s', $token));
        }

        return $client;
    }
}
