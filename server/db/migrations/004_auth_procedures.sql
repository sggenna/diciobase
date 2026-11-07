-- Stored procedures are the only way the API account can read or change the
-- users and sessions tables. Procedures that act on "the current user" take no
-- user id at all: they use app_user_id() (the signed context from 003).

-- p_email must share the users.email collation or MySQL refuses to compare them.
CREATE PROCEDURE auth_register(IN p_email VARCHAR(254) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_as_ci, IN p_hash VARCHAR(255), IN p_name VARCHAR(80))
  SQL SECURITY DEFINER
BEGIN
  DECLARE v_id BIGINT UNSIGNED;
  DECLARE EXIT HANDLER FOR 1062
  BEGIN
    ROLLBACK;
    SELECT NULL AS id;
  END;

  START TRANSACTION;
  INSERT INTO users (email, password_hash, display_name) VALUES (p_email, p_hash, p_name);
  SET v_id = LAST_INSERT_ID();
  INSERT INTO user_settings (user_id) VALUES (v_id);
  INSERT INTO audit_log (user_id, event) VALUES (v_id, 'register');
  COMMIT;
  SELECT v_id AS id;
END;
-- //

CREATE PROCEDURE auth_get_login(IN p_email VARCHAR(254) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_as_ci)
  SQL SECURITY DEFINER
BEGIN
  SELECT id,
         display_name,
         password_hash,
         (locked_until IS NOT NULL AND locked_until > CURRENT_TIMESTAMP) AS locked
  FROM users
  WHERE email = p_email
  LIMIT 1;
END;
-- //

-- Five straight failures lock the account for 15 minutes; any further failure
-- after that locks it again immediately. A success resets the counter.
CREATE PROCEDURE auth_login_failed(IN p_user_id BIGINT UNSIGNED)
  SQL SECURITY DEFINER
BEGIN
  UPDATE users
     SET failed_logins = LEAST(failed_logins + 1, 250),
         locked_until  = IF(failed_logins >= 5, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 15 MINUTE), locked_until)
   WHERE id = p_user_id;
  INSERT INTO audit_log (user_id, event) VALUES (p_user_id, 'login_failed');
END;
-- //

CREATE PROCEDURE auth_login_ok(IN p_user_id BIGINT UNSIGNED)
  SQL SECURITY DEFINER
BEGIN
  UPDATE users
     SET failed_logins = 0, locked_until = NULL, last_login_at = CURRENT_TIMESTAMP
   WHERE id = p_user_id;
  INSERT INTO audit_log (user_id, event) VALUES (p_user_id, 'login');
END;
-- //

CREATE PROCEDURE auth_session_create(
  IN p_user_id BIGINT UNSIGNED, IN p_token_hash BINARY(32), IN p_ttl_days INT, IN p_ua VARCHAR(200))
  SQL SECURITY DEFINER
BEGIN
  INSERT INTO sessions (user_id, token_hash, user_agent, expires_at)
  VALUES (p_user_id, p_token_hash, p_ua, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL p_ttl_days DAY));
  SELECT LAST_INSERT_ID() AS session_id;
END;
-- //

-- Resolves a session token hash to its user, enforcing absolute expiry, idle
-- expiry and revocation. Touches last_used_at at most every five minutes.
CREATE PROCEDURE auth_session_lookup(IN p_token_hash BINARY(32), IN p_idle_days INT)
  SQL SECURITY DEFINER
BEGIN
  UPDATE sessions
     SET last_used_at = CURRENT_TIMESTAMP
   WHERE token_hash = p_token_hash
     AND revoked_at IS NULL
     AND expires_at > CURRENT_TIMESTAMP
     AND last_used_at > DATE_SUB(CURRENT_TIMESTAMP, INTERVAL p_idle_days DAY)
     AND last_used_at < DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 5 MINUTE);

  SELECT s.id AS session_id, s.user_id, u.display_name, u.email
    FROM sessions s
    JOIN users u ON u.id = s.user_id
   WHERE s.token_hash = p_token_hash
     AND s.revoked_at IS NULL
     AND s.expires_at > CURRENT_TIMESTAMP
     AND s.last_used_at > DATE_SUB(CURRENT_TIMESTAMP, INTERVAL p_idle_days DAY)
   LIMIT 1;
END;
-- //

CREATE PROCEDURE auth_session_revoke(IN p_token_hash BINARY(32))
  SQL SECURITY DEFINER
BEGIN
  DELETE FROM sessions WHERE token_hash = p_token_hash;
END;
-- //

CREATE PROCEDURE auth_get_my_hash()
  SQL SECURITY DEFINER
BEGIN
  SELECT password_hash FROM users WHERE id = app_user_id();
END;
-- //

-- Changes the current user's password and signs out every other session.
CREATE PROCEDURE auth_change_password(IN p_new_hash VARCHAR(255), IN p_keep_session_id BIGINT UNSIGNED)
  SQL SECURITY DEFINER
BEGIN
  DECLARE v_uid BIGINT UNSIGNED DEFAULT app_user_id();
  IF v_uid IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'no_context';
  END IF;
  UPDATE users
     SET password_hash = p_new_hash, failed_logins = 0, locked_until = NULL,
         updated_at = CURRENT_TIMESTAMP
   WHERE id = v_uid;
  DELETE FROM sessions WHERE user_id = v_uid AND id <> p_keep_session_id;
  INSERT INTO audit_log (user_id, event) VALUES (v_uid, 'password_changed');
END;
-- //

-- Permanently deletes the current user and everything they own (cascade).
CREATE PROCEDURE auth_delete_me()
  SQL SECURITY DEFINER
BEGIN
  DECLARE v_uid BIGINT UNSIGNED DEFAULT app_user_id();
  IF v_uid IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'no_context';
  END IF;
  INSERT INTO audit_log (user_id, event) VALUES (NULL, 'account_deleted');
  DELETE FROM users WHERE id = v_uid;
END;
-- //

-- Housekeeping: expired sessions and old security events.
CREATE PROCEDURE auth_purge_expired()
  SQL SECURITY DEFINER
BEGIN
  DELETE FROM sessions
   WHERE expires_at < CURRENT_TIMESTAMP OR revoked_at IS NOT NULL;
  DELETE FROM audit_log WHERE created_at < DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 180 DAY);
END;
