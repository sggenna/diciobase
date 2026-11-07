-- Row-level security for MySQL (which has no native RLS).
--
-- How it works
--   * Before touching user data, the API sets the session variable @app_ctx to
--     "<user id>.<expiry unix seconds>.<hmac-sha256 hex>". The HMAC key lives
--     only in the API's environment and in rls_keys (unreadable by the API's
--     MySQL account), so a SQL injection cannot forge a context for another
--     user. Contexts expire after seconds and are cleared after every request.
--   * app_user_id() verifies that signature and returns the user id, or NULL.
--   * The API account may only touch user data through the my_* views below.
--     Each filters on app_user_id(), and WITH CHECK OPTION stops INSERT/UPDATE
--     from writing rows that belong to someone else.
--   * The views run with the definer's rights, so the API account needs no
--     grant on the underlying tables at all.

CREATE FUNCTION app_user_id() RETURNS BIGINT UNSIGNED
  NOT DETERMINISTIC
  READS SQL DATA
  SQL SECURITY DEFINER
BEGIN
  DECLARE v_ctx  VARCHAR(160) DEFAULT @app_ctx;
  DECLARE v_uid  BIGINT UNSIGNED;
  DECLARE v_exp  BIGINT UNSIGNED;
  DECLARE v_sig  CHAR(64);
  DECLARE v_key  BINARY(32);
  DECLARE v_k64  BINARY(64);
  -- Binary on purpose: mixing a utf8 variable with the binary pads would make
  -- MySQL try (and fail) to convert the pad bytes to text.
  DECLARE v_msg  VARBINARY(64);
  DECLARE v_mac  CHAR(64);

  IF v_ctx IS NULL OR v_ctx NOT REGEXP '^[0-9]{1,19}[.][0-9]{1,12}[.][0-9a-f]{64}$' THEN
    RETURN NULL;
  END IF;

  SET v_uid = CAST(SUBSTRING_INDEX(v_ctx, '.', 1) AS UNSIGNED);
  SET v_exp = CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(v_ctx, '.', 2), '.', -1) AS UNSIGNED);
  SET v_sig = SUBSTRING_INDEX(v_ctx, '.', -1);

  IF v_exp < UNIX_TIMESTAMP() THEN
    RETURN NULL;
  END IF;

  SELECT secret INTO v_key FROM rls_keys WHERE id = 1;
  IF v_key IS NULL THEN
    RETURN NULL;
  END IF;

  -- HMAC-SHA256(key, "<uid>.<exp>"), key zero-padded to the 64-byte block.
  SET v_k64 = RPAD(v_key, 64, UNHEX('00'));
  SET v_msg = CONCAT(v_uid, '.', v_exp);
  SET v_mac = SHA2(
    CONCAT(
      v_k64 ^ REPEAT(UNHEX('5c'), 64),
      UNHEX(SHA2(CONCAT(v_k64 ^ REPEAT(UNHEX('36'), 64), v_msg), 256))
    ),
    256
  );

  IF BINARY v_mac = BINARY v_sig THEN
    RETURN v_uid;
  END IF;
  RETURN NULL;
END;
-- //

CREATE SQL SECURITY DEFINER VIEW my_profile AS
  SELECT id, email, display_name, created_at, last_login_at
  FROM users
  WHERE id = app_user_id()
  WITH CASCADED CHECK OPTION;
-- //

CREATE SQL SECURITY DEFINER VIEW my_settings AS
  SELECT user_id, notifications_enabled, tips_enabled, interests, active_dicts
  FROM user_settings
  WHERE user_id = app_user_id()
  WITH CASCADED CHECK OPTION;
-- //

CREATE SQL SECURITY DEFINER VIEW my_saved_words AS
  SELECT user_id, lemma_id, saved_at
  FROM saved_words
  WHERE user_id = app_user_id()
  WITH CASCADED CHECK OPTION;
-- //

CREATE SQL SECURITY DEFINER VIEW my_search_history AS
  SELECT id, user_id, query, searched_at
  FROM search_history
  WHERE user_id = app_user_id()
  WITH CASCADED CHECK OPTION;
-- //

-- Active sessions of the current user. token_hash is deliberately not exposed.
CREATE SQL SECURITY DEFINER VIEW my_sessions AS
  SELECT id, user_id, user_agent, created_at, last_used_at, expires_at
  FROM sessions
  WHERE user_id = app_user_id()
    AND revoked_at IS NULL
    AND expires_at > CURRENT_TIMESTAMP
