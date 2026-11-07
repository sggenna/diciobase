-- Autocomplete must be instant, so "is this word worth suggesting?" is computed
-- once (after each import) instead of on every keystroke.
--   0 = never suggested
--   1 = has a thesaurus link            2 = has an OpenWordnet sense
--   3 = has a dictionary entry that is not just an inflected form
-- A word must also appear in at least one modern source: Dicionário Aberto
-- alone (a 1913 dictionary with old spellings) does not make a word suggestible.

ALTER TABLE lemmas
  ADD COLUMN suggest_rank TINYINT UNSIGNED NOT NULL DEFAULT 0,
  ADD KEY idx_lemmas_suggest (suggest_rank, norm);
-- //

CREATE PROCEDURE refresh_suggest_ranks()
  SQL SECURITY DEFINER
BEGIN
  UPDATE lemmas SET suggest_rank = 0 WHERE suggest_rank <> 0;

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
END;
-- //

CALL refresh_suggest_ranks();
