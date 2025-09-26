<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250926151316 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE audit_logs CHANGE id id BINARY(16) NOT NULL');
        $this->addSql('ALTER TABLE audit_logs RENAME INDEX idx_51ed7ed2a76ed395 TO IDX_D62F2858A76ED395');
        $this->addSql('ALTER TABLE password_reset_tokens CHANGE id id BINARY(16) NOT NULL');
        $this->addSql('ALTER TABLE password_reset_tokens RENAME INDEX idx_90d069c9a76ed395 TO IDX_3967A216A76ED395');
        $this->addSql('ALTER TABLE refresh_tokens CHANGE id id BINARY(16) NOT NULL');
        $this->addSql('ALTER TABLE refresh_tokens RENAME INDEX idx_9bace7e5a76ed395 TO IDX_9BACE7E1A76ED395');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE audit_logs CHANGE id id CHAR(36) NOT NULL');
        $this->addSql('ALTER TABLE audit_logs RENAME INDEX idx_d62f2858a76ed395 TO IDX_51ED7ED2A76ED395');
        $this->addSql('ALTER TABLE password_reset_tokens CHANGE id id CHAR(36) NOT NULL');
        $this->addSql('ALTER TABLE password_reset_tokens RENAME INDEX idx_3967a216a76ed395 TO IDX_90D069C9A76ED395');
        $this->addSql('ALTER TABLE refresh_tokens CHANGE id id CHAR(36) NOT NULL');
        $this->addSql('ALTER TABLE refresh_tokens RENAME INDEX idx_9bace7e1a76ed395 TO IDX_9BACE7E5A76ED395');
    }
}
