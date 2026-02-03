-- Run this in Supabase SQL Editor so the demo app can read toponyms directly.
-- Creates a view that matches the shape expected by DicioBase (idverbete, lema, estrutura_morfologica, categoria_gramatical).
-- If you get "relation does not exist", try the alternative at the bottom (quoted table names).

-- Option A: lowercase table names (Postgres default when schema uses unquoted CREATE TABLE)
CREATE OR REPLACE VIEW toponyms_view AS
SELECT
  V1.idverbete AS idverbete,
  MAX(CASE WHEN E.deelemento = 'Lema' THEN V1.deverbete END) AS lema,
  MAX(CASE WHEN E.deelemento = 'Estrutura Morfológica' THEN V1.deverbete END) AS estrutura_morfologica,
  MAX(CASE WHEN E.deelemento = 'Categoria Gramatical' THEN V1.deverbete END) AS categoria_gramatical
FROM verbete V1
JOIN elemento E ON V1.idelemento = E.idelemento
WHERE V1.idmicroestrutura = 1
GROUP BY V1.idverbete;

-- Allow anonymous (anon) read access so the app can load data
GRANT SELECT ON toponyms_view TO anon;

-- If the view above fails with "relation verbete does not exist", run this instead (quoted names):
-- CREATE OR REPLACE VIEW toponyms_view AS
-- SELECT
--   V1."idVerbete" AS idverbete,
--   MAX(CASE WHEN E."deElemento" = 'Lema' THEN V1."deVerbete" END) AS lema,
--   MAX(CASE WHEN E."deElemento" = 'Estrutura Morfológica' THEN V1."deVerbete" END) AS estrutura_morfologica,
--   MAX(CASE WHEN E."deElemento" = 'Categoria Gramatical' THEN V1."deVerbete" END) AS categoria_gramatical
-- FROM "Verbete" V1
-- JOIN "Elemento" E ON V1."idElemento" = E."idElemento"
-- WHERE V1."idMicroestrutura" = 1
-- GROUP BY V1."idVerbete";
-- GRANT SELECT ON toponyms_view TO anon;
