-- Prose dictionaries (Wikcionário, Dicionário Aberto): one entry per word and
-- part of speech, with numbered senses and examples. Read-only for the API.

CREATE TABLE dict_entries (
  id             INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  source_id      TINYINT UNSIGNED NOT NULL,
  lemma_id       INT UNSIGNED     NOT NULL,
  pos            VARCHAR(80)      NULL,
  etymology      TEXT             NULL,
  pronunciations JSON             NULL,
  PRIMARY KEY (id),
  KEY idx_dentries_lemma (lemma_id, source_id),
  KEY idx_dentries_source (source_id),
  CONSTRAINT fk_dentries_lemma  FOREIGN KEY (lemma_id)  REFERENCES lemmas (id)  ON DELETE CASCADE,
  CONSTRAINT fk_dentries_source FOREIGN KEY (source_id) REFERENCES sources (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
-- //

CREATE TABLE dict_senses (
  id       INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  entry_id INT UNSIGNED      NOT NULL,
  sense_no SMALLINT UNSIGNED NOT NULL,
  gloss    TEXT              NOT NULL,
  labels   VARCHAR(200)      NULL,
  PRIMARY KEY (id),
  KEY idx_dsenses_entry (entry_id, sense_no),
  CONSTRAINT fk_dsenses_entry FOREIGN KEY (entry_id) REFERENCES dict_entries (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
-- //

CREATE TABLE dict_examples (
  id       INT UNSIGNED NOT NULL AUTO_INCREMENT,
  sense_id INT UNSIGNED NOT NULL,
  example  TEXT         NOT NULL,
  PRIMARY KEY (id),
  KEY idx_dexamples_sense (sense_id),
  CONSTRAINT fk_dexamples_sense FOREIGN KEY (sense_id) REFERENCES dict_senses (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
