-- Dictionary / linguistic data. Read-only for the API account.
-- Statements are separated by a line containing only: -- //

CREATE TABLE sources (
  id           TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug         VARCHAR(40)  NOT NULL,
  name         VARCHAR(120) NOT NULL,
  kind         VARCHAR(30)  NOT NULL,
  license      VARCHAR(120) NOT NULL,
  license_url  VARCHAR(255) NULL,
  homepage     VARCHAR(255) NULL,
  attribution  VARCHAR(500) NOT NULL,
  commit_sha   CHAR(40)     NULL,
  imported_at  DATETIME     NULL,
  row_counts   JSON         NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_sources_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
-- //

-- `lemma` is exact (case + accent sensitive, so "Pais" and "país" stay apart).
-- `norm` carries the same text under an accent/case-insensitive collation and
-- is what searches use.
CREATE TABLE lemmas (
  id    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  lemma VARCHAR(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_as_cs NOT NULL,
  norm  VARCHAR(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_lemmas_lemma (lemma),
  KEY idx_lemmas_norm (norm)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
-- //

CREATE TABLE lemma_sources (
  lemma_id  INT UNSIGNED     NOT NULL,
  source_id TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (lemma_id, source_id),
  KEY idx_lemma_sources_source (source_id),
  CONSTRAINT fk_ls_lemma  FOREIGN KEY (lemma_id)  REFERENCES lemmas (id)  ON DELETE CASCADE,
  CONSTRAINT fk_ls_source FOREIGN KEY (source_id) REFERENCES sources (id) ON DELETE CASCADE
) ENGINE=InnoDB;
-- //

-- Grammatical labels some sources attach to a lemma (e.g. br.ispell "s.f.").
CREATE TABLE lemma_tags (
  lemma_id  INT UNSIGNED     NOT NULL,
  source_id TINYINT UNSIGNED NOT NULL,
  tag       VARCHAR(40)      NOT NULL,
  PRIMARY KEY (lemma_id, source_id, tag),
  CONSTRAINT fk_lt_lemma  FOREIGN KEY (lemma_id)  REFERENCES lemmas (id)  ON DELETE CASCADE,
  CONSTRAINT fk_lt_source FOREIGN KEY (source_id) REFERENCES sources (id) ON DELETE CASCADE
) ENGINE=InnoDB;
-- //

CREATE TABLE synsets (
  id        INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  wn_id     CHAR(10)         NOT NULL,
  pos       ENUM('n','v','a','r') NOT NULL,
  gloss     TEXT             NULL,
  source_id TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_synsets_wn (wn_id),
  KEY idx_synsets_source (source_id),
  CONSTRAINT fk_synsets_source FOREIGN KEY (source_id) REFERENCES sources (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
-- //

CREATE TABLE synset_examples (
  id        INT UNSIGNED NOT NULL AUTO_INCREMENT,
  synset_id INT UNSIGNED NOT NULL,
  example   TEXT         NOT NULL,
  PRIMARY KEY (id),
  KEY idx_examples_synset (synset_id),
  CONSTRAINT fk_examples_synset FOREIGN KEY (synset_id) REFERENCES synsets (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
-- //

CREATE TABLE senses (
  synset_id INT UNSIGNED      NOT NULL,
  sense_no  SMALLINT UNSIGNED NOT NULL,
  lemma_id  INT UNSIGNED      NOT NULL,
  PRIMARY KEY (synset_id, sense_no),
  KEY idx_senses_lemma (lemma_id, synset_id),
  CONSTRAINT fk_senses_synset FOREIGN KEY (synset_id) REFERENCES synsets (id) ON DELETE CASCADE,
  CONSTRAINT fk_senses_lemma  FOREIGN KEY (lemma_id)  REFERENCES lemmas (id)  ON DELETE CASCADE
) ENGINE=InnoDB;
-- //

CREATE TABLE synset_relations (
  synset_id        INT UNSIGNED NOT NULL,
  relation         VARCHAR(32)  NOT NULL,
  target_synset_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (synset_id, relation, target_synset_id),
  KEY idx_srel_target (target_synset_id, relation),
  CONSTRAINT fk_srel_from FOREIGN KEY (synset_id)        REFERENCES synsets (id) ON DELETE CASCADE,
  CONSTRAINT fk_srel_to   FOREIGN KEY (target_synset_id) REFERENCES synsets (id) ON DELETE CASCADE
) ENGINE=InnoDB;
-- //

-- Word-to-word links from thesauri (DicSin) and lexical antonyms (OpenWordnet).
CREATE TABLE lemma_relations (
  lemma_id         INT UNSIGNED     NOT NULL,
  relation         ENUM('synonym','antonym') NOT NULL,
  related_lemma_id INT UNSIGNED     NOT NULL,
  source_id        TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (lemma_id, relation, related_lemma_id, source_id),
  KEY idx_lrel_related (related_lemma_id, relation),
  KEY idx_lrel_source (source_id),
  CONSTRAINT fk_lrel_lemma   FOREIGN KEY (lemma_id)         REFERENCES lemmas (id)  ON DELETE CASCADE,
  CONSTRAINT fk_lrel_related FOREIGN KEY (related_lemma_id) REFERENCES lemmas (id)  ON DELETE CASCADE,
  CONSTRAINT fk_lrel_source  FOREIGN KEY (source_id)        REFERENCES sources (id) ON DELETE CASCADE
) ENGINE=InnoDB;
-- //

CREATE TABLE stopwords (
  word      VARCHAR(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_as_cs NOT NULL,
  source_id TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (word, source_id),
  CONSTRAINT fk_stop_source FOREIGN KEY (source_id) REFERENCES sources (id) ON DELETE CASCADE
) ENGINE=InnoDB;
