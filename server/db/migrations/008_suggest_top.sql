-- Short prefixes ("ca", "ter") match tens of thousands of words, and sorting
-- them on every keystroke is slow. The best 20 suggestions for every 1-3 letter
-- prefix are computed once (after each import) and read from this table instead.

CREATE TABLE suggest_top (
  prefix VARCHAR(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  pos    TINYINT UNSIGNED NOT NULL,
  lemma  VARCHAR(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_as_cs NOT NULL,
  PRIMARY KEY (prefix, pos)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- //

CREATE PROCEDURE refresh_suggest_top()
  SQL SECURITY DEFINER
BEGIN
  DELETE FROM suggest_top;

  INSERT INTO suggest_top (prefix, pos, lemma)
  SELECT p, rn, lemma FROM (
    SELECT LEFT(norm, 1) AS p, lemma,
           ROW_NUMBER() OVER (PARTITION BY LEFT(norm, 1)
             ORDER BY suggest_score DESC, (lemma = LOWER(lemma)) DESC, CHAR_LENGTH(lemma), lemma) AS rn
      FROM lemmas WHERE suggest_rank > 0 AND CHAR_LENGTH(lemma) > 2
  ) t WHERE rn <= 20;

  INSERT INTO suggest_top (prefix, pos, lemma)
  SELECT p, rn, lemma FROM (
    SELECT LEFT(norm, 2) AS p, lemma,
           ROW_NUMBER() OVER (PARTITION BY LEFT(norm, 2)
             ORDER BY suggest_score DESC, (lemma = LOWER(lemma)) DESC, CHAR_LENGTH(lemma), lemma) AS rn
      FROM lemmas WHERE suggest_rank > 0 AND CHAR_LENGTH(lemma) > 2
  ) t WHERE rn <= 20;

  INSERT INTO suggest_top (prefix, pos, lemma)
  SELECT p, rn, lemma FROM (
    SELECT LEFT(norm, 3) AS p, lemma,
           ROW_NUMBER() OVER (PARTITION BY LEFT(norm, 3)
             ORDER BY suggest_score DESC, (lemma = LOWER(lemma)) DESC, CHAR_LENGTH(lemma), lemma) AS rn
      FROM lemmas WHERE suggest_rank > 0 AND CHAR_LENGTH(lemma) > 2
  ) t WHERE rn <= 20;
END;
-- //

CALL refresh_suggest_top();
