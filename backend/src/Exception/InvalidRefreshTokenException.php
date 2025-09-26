<?php

declare(strict_types=1);

namespace App\Exception;

use Symfony\Component\HttpFoundation\Response;

class InvalidRefreshTokenException extends AuthenticationException
{
    public function __construct(string $message = 'Refresh token is invalid or has expired.', ?\Throwable $previous = null)
    {
        parent::__construct($message, Response::HTTP_UNAUTHORIZED, $previous);
    }
}
