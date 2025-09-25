<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20241001000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Initial schema for authentication and dashboard feature';
    }

    public function up(Schema $schema): void
    {
        $this->addSql("CREATE TABLE users (id CHAR(36) NOT NULL, email VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, first_name VARCHAR(100) DEFAULT NULL, last_name VARCHAR(100) DEFAULT NULL, is_active TINYINT(1) NOT NULL, is_verified TINYINT(1) NOT NULL, failed_login_attempts INT NOT NULL, locked_until DATETIME DEFAULT NULL, last_login_at DATETIME DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, UNIQUE INDEX uniq_user_email (email), INDEX idx_user_email_active (is_active, email), INDEX idx_user_created (created_at), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8MB4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB");
        $this->addSql("CREATE TABLE refresh_tokens (id CHAR(36) NOT NULL, user_id CHAR(36) NOT NULL, token VARCHAR(512) NOT NULL, family VARCHAR(255) NOT NULL, expires_at DATETIME NOT NULL, revoked_at DATETIME DEFAULT NULL, created_at DATETIME NOT NULL, INDEX idx_refresh_user_expires (user_id, expires_at), INDEX idx_refresh_family (family), UNIQUE INDEX uniq_refresh_token (token), INDEX IDX_9BACE7E5A76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8MB4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB");
        $this->addSql("CREATE TABLE password_reset_tokens (id CHAR(36) NOT NULL, user_id CHAR(36) NOT NULL, token VARCHAR(255) NOT NULL, expires_at DATETIME NOT NULL, used_at DATETIME DEFAULT NULL, created_at DATETIME NOT NULL, UNIQUE INDEX uniq_password_reset_token (token), INDEX idx_reset_user_expires (user_id, expires_at, used_at), INDEX IDX_90D069C9A76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8MB4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB");
        $this->addSql("CREATE TABLE audit_logs (id CHAR(36) NOT NULL, user_id CHAR(36) DEFAULT NULL, action VARCHAR(100) NOT NULL, ip_address VARCHAR(45) NOT NULL, user_agent VARCHAR(512) DEFAULT NULL, metadata JSON DEFAULT NULL, created_at DATETIME NOT NULL, INDEX idx_audit_user_created (user_id, created_at), INDEX idx_audit_action_created (action, created_at), INDEX idx_audit_ip_created (ip_address, created_at), INDEX IDX_51ED7ED2A76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8MB4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB");
        $this->addSql("ALTER TABLE refresh_tokens ADD CONSTRAINT FK_9BACE7E5A76ED395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE");
        $this->addSql("ALTER TABLE password_reset_tokens ADD CONSTRAINT FK_90D069C9A76ED395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE");
        $this->addSql("ALTER TABLE audit_logs ADD CONSTRAINT FK_51ED7ED2A76ED395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL");
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE refresh_tokens DROP FOREIGN KEY FK_9BACE7E5A76ED395');
        $this->addSql('ALTER TABLE password_reset_tokens DROP FOREIGN KEY FK_90D069C9A76ED395');
        $this->addSql('ALTER TABLE audit_logs DROP FOREIGN KEY FK_51ED7ED2A76ED395');
        $this->addSql('DROP TABLE users');
        $this->addSql('DROP TABLE refresh_tokens');
        $this->addSql('DROP TABLE password_reset_tokens');
        $this->addSql('DROP TABLE audit_logs');
    }
}
