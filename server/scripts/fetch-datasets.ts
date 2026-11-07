import { createHash } from "node:crypto"
import { createWriteStream } from "node:fs"
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { Readable } from "node:stream"
import { pipeline } from "node:stream/promises"
import { ALLOWED_HOSTS, SOURCES } from "./datasets.ts"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const rawDir = join(root, "data", "raw")
const lockPath = join(root, "datasets.lock.json")
const update = process.argv.includes("--update")

type Lock = Record<string, { sha256: string; bytes: number }>

async function readLock(): Promise<Lock> {
  try {
    return JSON.parse(await readFile(lockPath, "utf8"))
  } catch {
    return {}
  }
}

async function sha256File(path: string) {
  const hash = createHash("sha256")
  let bytes = 0
  const { createReadStream } = await import("node:fs")
  for await (const chunk of createReadStream(path)) {
    hash.update(chunk)
    bytes += (chunk as Buffer).length
  }
  return { sha256: hash.digest("hex"), bytes }
}

const lock = await readLock()
let changed = false

for (const src of SOURCES) {
  for (const f of src.files) {
    const key = `${src.slug}/${f.as}`
    const dest = join(rawDir, src.slug, f.as)
    await mkdir(dirname(dest), { recursive: true })

    // Reuse a file we already verified.
    try {
      const have = await sha256File(dest)
      if (lock[key] && lock[key].sha256 === have.sha256) {
        console.log(`ok      ${key} (cached, ${have.bytes} bytes)`)
        continue
      }
    } catch {
      /* not downloaded yet */
    }

    // GitHub files come from an immutable commit; the rest must be on an allow-listed host.
    const url = f.url ?? `https://raw.githubusercontent.com/${src.owner}/${src.repo}/${src.sha}/${f.path}`
    if (!ALLOWED_HOSTS.includes(new URL(url).hostname)) throw new Error(`Host not allowed: ${url}`)
    console.log(`fetch   ${key}`)
    const res = await fetch(url)
    if (!res.ok || !res.body) throw new Error(`${url} -> HTTP ${res.status}`)
    const tmp = `${dest}.part`
    await pipeline(Readable.fromWeb(res.body as never), createWriteStream(tmp))
    const got = await sha256File(tmp)

    if (lock[key] && lock[key].sha256 !== got.sha256 && !update) {
      await rm(tmp)
      throw new Error(
        `Checksum mismatch for ${key}\n  expected ${lock[key].sha256}\n  got      ${got.sha256}`,
      )
    }
    await rename(tmp, dest)
    if (!lock[key] || lock[key].sha256 !== got.sha256) {
      lock[key] = got
      changed = true
    }
    console.log(`        ${got.bytes} bytes  sha256 ${got.sha256.slice(0, 16)}…`)
  }
}

if (changed) {
  const sorted = Object.fromEntries(Object.entries(lock).sort(([a], [b]) => a.localeCompare(b)))
  await writeFile(lockPath, JSON.stringify(sorted, null, 2) + "\n")
  console.log("datasets.lock.json updated")
}
