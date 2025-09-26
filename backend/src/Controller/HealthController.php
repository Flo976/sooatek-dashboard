<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class HealthController extends AbstractController
{
    #[Route('/api/health', name: 'api_health', methods: ['GET'])]
    public function health(): JsonResponse
    {
        return $this->json([
            'status' => 'ok',
            'service' => 'Sooatek API',
            'version' => '1.0.0',
            'timestamp' => new \DateTime()
        ]);
    }

    #[Route('/api', name: 'api_docs', methods: ['GET'])]
    public function apiDocs(): JsonResponse
    {
        return $this->json([
            'message' => 'Welcome to Sooatek API',
            'documentation' => '/api/docs',
            'version' => '1.0.0',
            'endpoints' => [
                'health' => '/api/health',
                'users' => '/api/users',
                'auth' => '/api/auth/login'
            ]
        ]);
    }
}