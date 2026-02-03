-- Use this ONLY if the other script failed with "relation verbete does not exist".
-- Copy all and run in Supabase: SQL Editor → New query → Paste → Run.

BEGIN;

CREATE OR REPLACE VIEW public.toponyms_view AS
SELECT
  V1."idVerbete" AS idverbete,
  MAX(CASE WHEN E."deElemento" = 'Lema' THEN V1."deVerbete" END) AS lema,
  MAX(CASE WHEN E."deElemento" = 'Estrutura Morfológica' THEN V1."deVerbete" END) AS estrutura_morfologica,
  MAX(CASE WHEN E."deElemento" = 'Categoria Gramatical' THEN V1."deVerbete" END) AS categoria_gramatical
FROM "Verbete" V1
JOIN "Elemento" E ON V1."idElemento" = E."idElemento"
WHERE V1."idMicroestrutura" = 1
GROUP BY V1."idVerbete";

GRANT SELECT ON public.toponyms_view TO anon;
GRANT SELECT ON public.toponyms_view TO authenticated;

COMMIT;
