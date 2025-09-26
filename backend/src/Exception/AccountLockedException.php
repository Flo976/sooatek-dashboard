<?php

declare(strict_types=1);

namespace App\Exception;

use Symfony\Component\HttpFoundation\Response;

class AccountLockedException extends AuthenticationException
{
    public function __construct(string $message = 'Account temporarily locked due to failed login attempts.', ?\Throwable $previous = null)
    {
        parent::__construct($message, Response::HTTP_LOCKED, $previous);
    }
}
