import { createHash, randomBytes } from "node:crypto"

export const TOKEN_RE = /^[A-Za-z0-9_-]{43}$/

/** 256 bits from the OS CSPRNG. Only its SHA-256 is ever stored. */
export function newSessionToken() {
  const token = randomBytes(32).toString("base64url")
  return { token, hash: hashToken(token) }
}

export const hashToken = (token: string) => createHash("sha256").update(token).digest()
