import { Router } from "express"
import { ping, query } from "../db.ts"

export const meta = Router()

meta.get("/health", async (_req, res) => {
  const ok = await ping()
  res.status(ok ? 200 : 503).json({ ok })
})

// Licences and attribution for every dataset (several require it).
meta.get("/sources", async (_req, res) => {
  const rows = await query(
    "SELECT slug, name, kind, license, license_url, homepage, attribution, imported_at, row_counts FROM sources ORDER BY name",
  )
  res.json({
    sources: rows.map((r) => ({
      slug: r.slug,
      name: r.name,
      kind: r.kind,
      license: r.license,
      licenseUrl: r.license_url,
      homepage: r.homepage,
      attribution: r.attribution,
      importedAt: r.imported_at,
      counts: typeof r.row_counts === "string" ? JSON.parse(r.row_counts) : r.row_counts,
    })),
  })
})
