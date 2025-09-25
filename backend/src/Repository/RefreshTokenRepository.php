<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\RefreshToken;
use App\Entity\User;
use DateTimeImmutable;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<RefreshToken>
 */
class RefreshTokenRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, RefreshToken::class);
    }

    public function revokeFamily(string $family, DateTimeImmutable $revokedAt): int
    {
        return $this->createQueryBuilder('rt')
            ->update()
            ->set('rt.revokedAt', ':revokedAt')
            ->where('rt.family = :family')
            ->setParameter('revokedAt', $revokedAt)
            ->setParameter('family', $family)
            ->getQuery()
            ->execute();
    }

    public function countActiveTokens(User $user, DateTimeImmutable $now): int
    {
        return (int) $this->createQueryBuilder('rt')
            ->select('COUNT(rt.id)')
            ->where('rt.user = :user')
            ->andWhere('rt.expiresAt > :now')
            ->andWhere('rt.revokedAt IS NULL')
            ->setParameter('user', $user)
            ->setParameter('now', $now)
            ->getQuery()
            ->getSingleScalarResult();
    }
}
