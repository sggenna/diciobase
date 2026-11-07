-- User data. The API account has NO direct access to any table in this file;
-- it reaches them only through the row-scoped views and auth_* procedures
-- created in 003 / 004.

CREATE TABLE users (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email         VARCHAR(254) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_as_ci NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name  VARCHAR(80)  NOT NULL,
  failed_logins TINYINT UNSIGNED NOT NULL DEFAULT 0,
  locked_until  DATETIME NULL,
  last_login_at DATETIME NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
-- //

CREATE TABLE user_settings (
  user_id               BIGINT UNSIGNED NOT NULL,
  notifications_enabled TINYINT(1) NOT NULL DEFAULT 1,
  tips_enabled          TINYINT(1) NOT NULL DEFAULT 1,
  interests             JSON NOT NULL DEFAULT (JSON_ARRAY()),
  active_dicts          JSON NOT NULL DEFAULT (JSON_OBJECT('aurelio', true, 'houaiss', true, 'michaelis', false)),
  PRIMARY KEY (user_id),
  CONSTRAINT fk_settings_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;
-- //

-- Only the SHA-256 of a session token is stored, never the token itself.
CREATE TABLE sessions (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id      BIGINT UNSIGNED NOT NULL,
  token_hash   BINARY(32)      NOT NULL,
  user_agent   VARCHAR(200)    NULL,
  created_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_used_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at   DATETIME        NOT NULL,
  revoked_at   DATETIME        NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_sessions_token (token_hash),
  KEY idx_sessions_user (user_id),
  KEY idx_sessions_expires (expires_at),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;
-- //

CREATE TABLE saved_words (
  user_id  BIGINT UNSIGNED NOT NULL,
  lemma_id INT UNSIGNED    NOT NULL,
  saved_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, lemma_id),
  KEY idx_saved_user_time (user_id, saved_at),
  CONSTRAINT fk_saved_user  FOREIGN KEY (user_id)  REFERENCES users (id)  ON DELETE CASCADE,
  CONSTRAINT fk_saved_lemma FOREIGN KEY (lemma_id) REFERENCES lemmas (id) ON DELETE CASCADE
) ENGINE=InnoDB;
-- //

CREATE TABLE search_history (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     BIGINT UNSIGNED NOT NULL,
  query       VARCHAR(120) NOT NULL,
  searched_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_history_user_time (user_id, searched_at),
  CONSTRAINT fk_history_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
-- //

-- Security events. No IP addresses or other personal data beyond the user id.
CREATE TABLE audit_log (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NULL,
  event      VARCHAR(40)  NOT NULL,
  detail     VARCHAR(200) NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_audit_user (user_id, created_at),
  KEY idx_audit_time (created_at),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
-- //

-- Verification key for the row-level-security context (see 003). Readable only
-- by the definer of app_user_id(); the API account has no privileges on it.
CREATE TABLE rls_keys (
  id     TINYINT UNSIGNED NOT NULL,
  secret BINARY(32)       NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB;
