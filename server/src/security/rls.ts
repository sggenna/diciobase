import { createHmac } from "node:crypto"
import { config } from "../config.ts"

const key = Buffer.from(config.RLS_SECRET, "hex")
const TTL_SECONDS = 30

/**
 * Builds the signed row-level-security context that MySQL's app_user_id()
 * verifies: "<user id>.<expiry>.<hmac-sha256>". Only this process holds the
 * key, so SQL run through the API account cannot impersonate another user.
 */
export function mintContext(userId: number, now = Date.now()): string {
  if (!Number.isSafeInteger(userId) || userId <= 0) throw new Error("invalid user id")
  const msg = `${userId}.${Math.floor(now / 1000) + TTL_SECONDS}`
  const sig = createHmac("sha256", key).update(msg).digest("hex")
  return `${msg}.${sig}`
}
