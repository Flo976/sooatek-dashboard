<?php

declare(strict_types=1);

namespace App\Exception;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;

class AuthenticationException extends HttpException
{
    public function __construct(string $message = 'Invalid credentials provided.', int $statusCode = Response::HTTP_UNAUTHORIZED, ?\Throwable $previous = null)
    {
        parent::__construct($statusCode, $message, $previous);
    }
}
