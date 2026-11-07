-- The dictionaries a reader can turn on and off are the open ones the API
-- serves. Every account starts with all three on.

ALTER TABLE user_settings
  ALTER COLUMN active_dicts SET DEFAULT (JSON_OBJECT('wikcionario', true, 'dicionario-aberto', true, 'wordnet', true));
-- //

UPDATE user_settings
   SET active_dicts = JSON_OBJECT('wikcionario', true, 'dicionario-aberto', true, 'wordnet', true);
