<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\PasswordResetToken;
use App\Entity\User;
use DateTimeImmutable;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<PasswordResetToken>
 */
class PasswordResetTokenRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, PasswordResetToken::class);
    }

    public function countActiveTokensForUser(User $user, DateTimeImmutable $now): int
    {
        return (int) $this->createQueryBuilder('prt')
            ->select('COUNT(prt.id)')
            ->where('prt.user = :user')
            ->andWhere('prt.expiresAt > :now')
            ->andWhere('prt.usedAt IS NULL')
            ->setParameter('user', $user)
            ->setParameter('now', $now)
            ->getQuery()
            ->getSingleScalarResult();
    }
}
