-- Migration 001: let admins log in.
-- Adds ADMIN.Password (bcrypt hash). Safe to run on a database that already has data, and safe to
-- run more than once. sql/schema.sql already contains this column for fresh installs.
--
-- Run:   node scripts/run-sql.js sql/migrations/001_admin_password.sql
-- Then give each existing admin a password:
--        node scripts/set-admin-password.js admin@campus.edu <password>

USE campusfind_ai;

-- MySQL has no "ADD COLUMN IF NOT EXISTS", so check information_schema first.
-- LOWER() because table names are stored in lowercase on Windows and as written on Linux.
SET @has_password := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND LOWER(TABLE_NAME) = 'admin'
      AND COLUMN_NAME = 'Password'
);

SET @ddl := IF(@has_password = 0,
    'ALTER TABLE ADMIN ADD COLUMN Password VARCHAR(255) NULL',
    'SELECT ''ADMIN.Password already exists, nothing to do'' AS migration_001');

PREPARE migration_stmt FROM @ddl;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;
