-- Autocomplete ordering: common words tend to have many senses and links, so
-- how much we know about a word is a good stand-in for how common it is.

ALTER TABLE lemmas
  ADD COLUMN suggest_score MEDIUMINT UNSIGNED NOT NULL DEFAULT 0;
-- //

DROP PROCEDURE refresh_suggest_ranks;
-- //

CREATE PROCEDURE refresh_suggest_ranks()
  SQL SECURITY DEFINER
BEGIN
  UPDATE lemmas SET suggest_rank = 0 WHERE suggest_rank <> 0;
  UPDATE lemmas SET suggest_score = 0 WHERE suggest_score <> 0;

  UPDATE lemmas l
    JOIN (SELECT lemma_id AS id FROM lemma_relations
          UNION SELECT related_lemma_id FROM lemma_relations) x ON x.id = l.id
     SET l.suggest_rank = 1;

  UPDATE lemmas l
    JOIN (SELECT DISTINCT lemma_id AS id FROM senses) x ON x.id = l.id
     SET l.suggest_rank = 2;

  UPDATE lemmas l
    JOIN (SELECT DISTINCT lemma_id AS id FROM dict_entries
           WHERE pos IS NULL OR pos NOT LIKE 'forma %') x ON x.id = l.id
     SET l.suggest_rank = 3;

  UPDATE lemmas l
     SET l.suggest_rank = 0
   WHERE l.suggest_rank > 0
     AND NOT EXISTS (SELECT 1 FROM lemma_sources ls JOIN sources s ON s.id = ls.source_id
                      WHERE ls.lemma_id = l.id AND s.slug <> 'dicionario-aberto');

  -- Score = senses (OpenWordnet) + senses in non-inflection dictionary entries + thesaurus links (capped).
  UPDATE lemmas l
    JOIN (SELECT lemma_id AS id, COUNT(*) AS n FROM senses GROUP BY lemma_id) x ON x.id = l.id
     SET l.suggest_score = LEAST(l.suggest_score + x.n, 16000000)
   WHERE l.suggest_rank > 0;

  UPDATE lemmas l
    JOIN (SELECT e.lemma_id AS id, COUNT(*) AS n
            FROM dict_entries e JOIN dict_senses s ON s.entry_id = e.id
           WHERE e.pos IS NULL OR e.pos NOT LIKE 'forma %'
           GROUP BY e.lemma_id) x ON x.id = l.id
     SET l.suggest_score = LEAST(l.suggest_score + x.n, 16000000)
   WHERE l.suggest_rank > 0;

  UPDATE lemmas l
    JOIN (SELECT id, COUNT(*) AS n
            FROM (SELECT lemma_id AS id FROM lemma_relations
                  UNION ALL SELECT related_lemma_id FROM lemma_relations) r
           GROUP BY id) x ON x.id = l.id
     SET l.suggest_score = LEAST(l.suggest_score + LEAST(x.n, 20), 16000000)
   WHERE l.suggest_rank > 0;
END;
-- //

CALL refresh_suggest_ranks();
