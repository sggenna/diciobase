import { z } from "zod"

const noControl = (s: string) => !/[\p{Cc}\p{Cf}]/u.test(s)

export const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .pipe(z.email())

// Length limits only (NIST 800-63B): no composition rules, long passphrases welcome.
export const password = z.string().min(8).max(128)

export const displayName = z.string().trim().min(1).max(80).refine(noControl)

export const registerBody = z
  .object({ email, password, name: displayName })
  .strict()
  .refine((b) => b.password.toLowerCase() !== b.email, { path: ["password"] })

export const loginBody = z.object({ email, password: z.string().min(1).max(128) }).strict()

export const changePasswordBody = z.object({ current: z.string().min(1).max(128), next: password }).strict()

export const deleteAccountBody = z.object({ password: z.string().min(1).max(128) }).strict()

export const profilePatch = z.object({ name: displayName }).strict()

const dictToggles = z
  .object({ wikcionario: z.boolean(), "dicionario-aberto": z.boolean(), wordnet: z.boolean() })
  .strict()
  .refine((d) => d.wikcionario || d["dicionario-aberto"] || d.wordnet, { message: "at least one dictionary" })

export const settingsPatch = z
  .object({
    notifications: z.boolean().optional(),
    tips: z.boolean().optional(),
    interests: z.array(z.string().trim().min(1).max(40).refine(noControl)).max(12).optional(),
    dicts: dictToggles.optional(),
  })
  .strict()

export const word = z.string().trim().min(1).max(100).refine(noControl)

export const saveBody = z.object({ word }).strict()
export const searchBody = z.object({ query: z.string().trim().min(1).max(120).refine(noControl) }).strict()

export const idParam = z.coerce.number().int().positive().max(Number.MAX_SAFE_INTEGER)

export const page = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).max(10_000).default(0),
})

export const searchQuery = z.object({
  q: z.string().trim().min(1).max(60).refine(noControl),
  limit: z.coerce.number().int().min(1).max(20).default(10),
})

/** Escapes LIKE wildcards so user input is matched literally. Pair with ESCAPE '|'. */
export const escapeLike = (s: string) => s.replace(/[|%_]/g, (c) => `|${c}`)
