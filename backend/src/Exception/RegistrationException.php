<?php

declare(strict_types=1);

namespace App\Exception;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;

class RegistrationException extends HttpException
{
    public function __construct(string $message = 'Unable to register user.', int $statusCode = Response::HTTP_BAD_REQUEST, ?\Throwable $previous = null)
    {
        parent::__construct($statusCode, $message, $previous);
    }
}
