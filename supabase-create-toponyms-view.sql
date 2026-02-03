-- Copy ALL of this and run in Supabase: SQL Editor → New query → Paste → Run.
-- This creates public.toponyms_view so the app can load toponyms.

-- If you get "relation verbete does not exist", skip to the second block (PascalCase tables).
BEGIN;

-- Option A: tables are lowercase (verbete, elemento)
CREATE OR REPLACE VIEW public.toponyms_view AS
SELECT
  V1.idverbete AS idverbete,
  MAX(CASE WHEN E.deelemento = 'Lema' THEN V1.deverbete END) AS lema,
  MAX(CASE WHEN E.deelemento = 'Estrutura Morfológica' THEN V1.deverbete END) AS estrutura_morfologica,
  MAX(CASE WHEN E.deelemento = 'Categoria Gramatical' THEN V1.deverbete END) AS categoria_gramatical
FROM verbete V1
JOIN elemento E ON V1.idelemento = E.idelemento
WHERE V1.idmicroestrutura = 1
GROUP BY V1.idverbete;

GRANT SELECT ON public.toponyms_view TO anon;
GRANT SELECT ON public.toponyms_view TO authenticated;

COMMIT;
