import { createHmac } from "node:crypto"
import argon2 from "argon2"
import { config } from "../config.ts"

const pepper = Buffer.from(config.PASSWORD_PEPPER, "hex")

// OWASP-recommended argon2id parameters, with headroom above their minimum.
const PARAMS = { type: argon2.argon2id, memoryCost: 65536, timeCost: 3, parallelism: 1 } as const

// The pepper is applied first, and the digest (not the raw password) goes into
// argon2. A leaked database alone is then useless for offline guessing, and
// very long passwords cannot be used to burn CPU.
const prehash = (password: string) => createHmac("sha256", pepper).update(password, "utf8").digest("base64")

export const hashPassword = (password: string) => argon2.hash(prehash(password), PARAMS)

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, prehash(password))
  } catch {
    return false
  }
}

export const needsRehash = (hash: string) => argon2.needsRehash(hash, PARAMS)

// Verified against when the e-mail is unknown, so "no such user" and "wrong
// password" take the same time.
let dummy: Promise<string> | undefined
export function verifyDummy(password: string) {
  dummy ??= hashPassword("not-a-real-account-password")
  return dummy.then((h) => verifyPassword(h, password))
}
