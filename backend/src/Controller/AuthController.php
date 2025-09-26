<?php

declare(strict_types=1);

namespace App\Controller;

use App\Exception\BadRequestException;
use App\Entity\User;
use App\Service\AuthenticationService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\Routing\Attribute\Route;

class AuthController extends AbstractController
{
    #[Route('/api/v1/auth/login', name: 'api_auth_login', methods: ['POST'])]
    public function login(Request $request, AuthenticationService $authenticationService): JsonResponse
    {
        $payload = $this->decodeJson($request);

        try {
            $result = $authenticationService->authenticate(
                (string) ($payload['email'] ?? ''),
                (string) ($payload['password'] ?? ''),
                $request->getClientIp() ?? 'unknown',
                $request->headers->get('User-Agent')
            );
        } catch (HttpExceptionInterface $exception) {
            return $this->json(
                ['message' => $exception->getMessage()],
                $exception->getStatusCode()
            );
        }

        return $this->json([
            'accessToken' => $result['accessToken'],
            'refreshToken' => $result['refreshToken'],
            'tokenType' => 'Bearer',
            'expiresIn' => $result['expiresIn'],
            'user' => $result['user'],
        ]);
    }

    #[Route('/api/v1/auth/register', name: 'api_auth_register_options', methods: ['OPTIONS'])]
    public function registerOptions(): Response
    {
        return new Response(null, Response::HTTP_NO_CONTENT);
    }

    #[Route('/api/v1/auth/register', name: 'api_auth_register', methods: ['POST'])]
    public function register(Request $request, AuthenticationService $authenticationService): JsonResponse
    {
                $payload = $this->decodeJson($request);

        try {
            $user = $authenticationService->register($payload, $request->getClientIp() ?? 'unknown', $request->headers->get('User-Agent'));
        } catch (HttpExceptionInterface $exception) {
            return $this->json(
                ['message' => $exception->getMessage()],
                $exception->getStatusCode()
            );
        }

        return $this->json([
            'message' => 'Registration successful. You can now log in.',
            'user' => $user,
        ], Response::HTTP_CREATED);
    }

    #[Route('/api/v1/auth/refresh', name: 'api_auth_refresh', methods: ['POST'])]
    public function refresh(Request $request, AuthenticationService $authenticationService): JsonResponse
    {
        $payload = $this->decodeJson($request);

        try {
            $result = $authenticationService->refresh(
                (string) ($payload['refreshToken'] ?? ''),
                $request->getClientIp() ?? 'unknown',
                $request->headers->get('User-Agent')
            );
        } catch (HttpExceptionInterface $exception) {
            return $this->json(
                ['message' => $exception->getMessage()],
                $exception->getStatusCode()
            );
        }

        return $this->json([
            'accessToken' => $result['accessToken'],
            'refreshToken' => $result['refreshToken'],
            'expiresIn' => $result['expiresIn'],
        ]);
    }

    #[Route('/api/v1/auth/logout', name: 'api_auth_logout', methods: ['POST'])]
    public function logout(Request $request, AuthenticationService $authenticationService): JsonResponse
    {
        $payload = $this->decodeJson($request);
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json(['message' => 'Authentication required.'], Response::HTTP_UNAUTHORIZED);
        }

        try {
            $authenticationService->logout(
                $user,
                (string) ($payload['refreshToken'] ?? ''),
                $request->getClientIp() ?? 'unknown',
                $request->headers->get('User-Agent')
            );
        } catch (HttpExceptionInterface $exception) {
            return $this->json(
                ['message' => $exception->getMessage()],
                $exception->getStatusCode()
            );
        }

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    private function decodeJson(Request $request): array
    {
        $content = trim((string) $request->getContent());
        if ($content === '') {
            return [];
        }

        try {
            $payload = json_decode($content, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException $exception) {
            throw new BadRequestException('Invalid JSON payload provided.', $exception);
        }

        return is_array($payload) ? $payload : [];
    }
}
