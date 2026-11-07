import { existsSync, readFileSync, writeFileSync, chmodSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

export const serverRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..")
export const envPath = join(serverRoot, ".env")

/** Loads server/.env into process.env without overriding real environment variables. */
export function loadEnv() {
  if (existsSync(envPath)) process.loadEnvFile(envPath)
}

/** Reads KEY=VALUE pairs without touching process.env. */
export function readEnvFile(): Map<string, string> {
  const out = new Map<string, string>()
  if (!existsSync(envPath)) return out
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line)
    if (m) out.set(m[1]!, m[2]!.replace(/^["']|["']$/g, ""))
  }
  return out
}

/**
 * Sets keys in server/.env, keeping every other line and comment. The file is
 * created owner-readable only (0600) because it holds secrets.
 */
export function writeEnvValues(values: Record<string, string>, templatePath?: string) {
  let text = existsSync(envPath)
    ? readFileSync(envPath, "utf8")
    : templatePath && existsSync(templatePath)
      ? readFileSync(templatePath, "utf8")
      : ""
  for (const [key, value] of Object.entries(values)) {
    const line = `${key}=${value}`
    const re = new RegExp(`^\\s*${key}\\s*=.*$`, "m")
    text = re.test(text) ? text.replace(re, () => line) : text.replace(/\n*$/, "\n") + line + "\n"
  }
  writeFileSync(envPath, text, { mode: 0o600 })
  chmodSync(envPath, 0o600)
}
