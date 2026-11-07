# Diciobase API

Express + MySQL backend: Portuguese linguistic datasets in SQL, plus user accounts, saved words and settings with database-enforced row isolation.

```
src/                 Express app (routes, middleware, security helpers)
db/migrations/       SQL schema, row-level security, auth procedures
scripts/             db-setup, db-migrate, datasets fetch/import (+ parsers)
test/                RLS, API, injection and guard-rail tests (node:test)
datasets.lock.json   SHA-256 of every downloaded dataset file
.env.example         Template. The real server/.env is git-ignored.
```

## First run

Requires Node 22+, pnpm and a running MySQL 8+ (utf8mb4).

```bash
cd server
pnpm install
pnpm db:setup        # prompts (hidden) for a MySQL admin password; creates the DB,
                     # two accounts and every secret, written to server/.env (0600)
pnpm db:migrate      # schema, RLS views, procedures, least-privilege grants
pnpm datasets:fetch  # downloads the pinned datasets (~60 MB) and verifies checksums
pnpm db:import       # loads them into MySQL (about a minute)
pnpm dev             # API on http://127.0.0.1:3001
```

In another terminal, `pnpm dev` at the repo root starts the site; Vite proxies `/api` to the API, so the session cookie is first-party.

The MySQL admin password is used once and is never stored. Nothing secret is printed.
Tests: `pnpm test` (needs the database above; it creates and removes its own users).

## Datasets

All come from the index at <https://github.com/EticaAI/linguistic-datasets-portuguese>. Each file is fetched from an immutable commit SHA and checked against `datasets.lock.json` before import.

| Dataset | What it adds | Licence |
| --- | --- | --- |
| OpenWordnet-PT | 117,659 synsets, 83,707 word senses, glosses, examples, 196k relations, antonyms | CC BY 4.0 |
| DicSin pt-BR | ~455k synonym/antonym links | GPL-2.0 (upstream: "GPLv2?") |
| VERO pt-BR | 310k headwords (word list) | LGPL-3.0 / MPL |
| br.ispell | 20k headwords with grammatical tags | GPL-2.0 |
| stopwords-pt | 560 stopwords | MIT |
| **Wikcionário** (via kaikki.org) | ~401k entries, ~566k senses, examples, etymology, IPA (Brazil/Portugal), synonyms. The richest modern source. | CC BY-SA 4.0 |
| **Dicionário Aberto** | ~128k entries, ~212k senses. A 1913 dictionary, so old spellings and mostly European Portuguese. | CC BY-SA 2.5 PT |

Notes on the two prose dictionaries:
- Wikcionário comes from kaikki.org's extract of the 2026-10-01 pt.wiktionary dump (343 MB). kaikki marks that file as deprecated and may remove it; the checksum in `datasets.lock.json` will then fail loudly, and the copy you already downloaded keeps working.
- Dicionário Aberto words are not suggested in autocomplete (their old spellings would flood it) unless a modern source also has the word. They are still found by typing them, and show as a tab for words both have.
- Autocomplete uses two precomputed columns on `lemmas` (`suggest_rank`, `suggest_score`), refreshed by `refresh_suggest_ranks()` at the end of every `pnpm db:import`. Words we know more about come first, which is a stand-in for how common they are.
- Both are share-alike (CC BY-SA): show the credit (the app does, in each tab) and keep the same licence on adapted copies of their text.

Not imported: the languagetool rule files and false-friends list (grammar rules and an English-Portuguese table, not dictionary data), and the repository's own "wish list".

Things to know:
- **Only ~8k of 117k synsets have a Portuguese gloss.** OpenWordnet-PT is mostly synonym sets; real definitions still come from the dictionaries the site already shows.
- DicSin has ~50 headwords with a corrupted first character; they were repaired when possible (2) or skipped (52). Counts are stored in `sources.row_counts`.
- **Licences travel with the data.** `GET /api/sources` and every word entry list the sources used. CC BY needs attribution (see `NOTICE.md`). The GPL datasets are in their own rows (`source_id`), so they can be dropped with `DELETE FROM sources WHERE slug IN ('dicsin','br-ispell')` if their terms do not suit how you ship the product. Check this before launch; it is not legal advice.

## Security model

**Secrets.** `server/.env` (and any `.env.*`, `*.pem`, `*.key`) is git-ignored; a test fails if that ever changes. Config is validated at startup and fails with variable names only, never values. Logs redact passwords, cookies and e-mails.

**SQL injection.**
1. Every runtime query is a static string run as a server-side prepared statement (`execute`); values never become SQL text. A test fails the build if any query is built with string interpolation.
2. Stacked statements are disabled, so even a hypothetical injection cannot run a second statement.
3. The API's MySQL account is least-privilege: read-only on dictionary tables, no access to `users`, `sessions` or any other user table, no DDL. A test proves each of those is refused.
4. LIKE wildcards in search are escaped; `LIMIT`/`OFFSET` are validated integers bound as parameters.

**Row-level security (MySQL has no native RLS, so it is built from these parts).**
- User data is reachable only through `my_*` views that filter on `app_user_id()`, with `WITH CHECK OPTION` so rows cannot be written for another user.
- `app_user_id()` reads a per-request context signed with HMAC-SHA-256 (`<user>.<expiry>.<sig>`), verified inside MySQL against a key the API account cannot read. The signature expires in 30 seconds and is cleared when the connection returns to the pool. An attacker who can run SQL through the API account cannot forge another user's context.
- The only way to touch `users`/`sessions` is a handful of `auth_*` stored procedures; the ones that act on "me" take no user id at all.
- The API additionally names `user_id` in every query (defence in depth, and it keeps indexes usable).

**Accounts and sessions.**
- Passwords: argon2id (64 MiB, 3 passes) over an HMAC-SHA-256 pepper kept in `.env`, so a stolen database alone is not enough to crack them.
- Login does the same work for unknown users, locked accounts and wrong passwords, and returns an identical response (no user enumeration). 5 failures lock an account for 15 minutes; per-IP and per-account rate limits apply on top.
- Sessions are 256-bit random tokens in an `HttpOnly`, `SameSite=Lax`, `Secure` (production) cookie. Only the SHA-256 of the token is stored. Absolute (30 d) and idle (7 d) expiry, new token on every login, revoke on logout, "sign out other devices", and changing the password signs out every other session.
- CSRF: allow-listed `Origin` required on writes, JSON-only bodies, plus `SameSite`.
- Helmet headers, `Cache-Control: no-store` on every response, 16 KB body limit, strict zod schemas (unknown fields are rejected), generic error bodies.
- Privacy: no IP addresses stored, searched words are per user and clearable, `GET /api/me/export` returns all of a user's data, `POST /api/me/delete-account` erases it (cascade).

## Word pages and link previews

Every entry has an address (`/palavra/saudade`). Crawlers don't run JavaScript, so `src/routes/site.ts` serves the built `index.html` with that word's `<title>`, Open Graph and Twitter tags already in it, and `/og/palavra/saudade.png` renders the 1200x630 preview image (satori + resvg, in Source Serif 4 and Inter, both OFL, installed with the server). Images are cached in memory for 6 h and sent with a one-day `Cache-Control`. In development, Vite adds the same tags by asking the API (`/api/words/:word/preview`), so `curl localhost:8443/palavra/saudade` shows the real output.

**What depends on the host:**

- **The server has to answer `/palavra/*` and `/og/*`.** The simplest setup is one Node process for everything: run `pnpm build` at the repo root and start this server, which serves `dist/` (or `SITE_DIST`), the pages and `/api` from one origin. A purely static host cannot produce per-word tags.
- **If the site stays on a static host or CDN (Vercel, Netlify, Cloudflare Pages),** rewrite `/palavra/:word`, `/og/:path*` and `/api/:path*` to this server, and deploy the same `dist/` next to the server, because it injects the tags into that `index.html`. Its asset hashes must match what the CDN serves. Other paths need the usual SPA fallback to `index.html`. Rewrites, not redirects: the shared address has to stay the public one.
- **Vercel Analytics (`/_vercel/insights`) only exists on Vercel.** Elsewhere the script 404s, harmlessly but with no data. The page CSP in `site.ts` allows same-origin scripts only, which is enough for it on Vercel.
- **`SITE_URL`** sets the origin in `og:url` and `og:image`; it falls back to the first `CORS_ORIGINS` entry in production. Previews need an absolute `https://` address that is publicly reachable.
- **Native modules:** `@resvg/resvg-js` ships prebuilt binaries per platform (as `argon2` needs its own), so build on or for the target OS. Edge runtimes can't run it.
- **The server imports `src/lib/syllables.ts` from the frontend,** so that it can't disagree with the page. Deploy the repo with `src/` present.
- **Several instances:** the image cache and rate limits are per process. A CDN in front of `/og/*` absorbs most of that; responses are already marked public.
- **`robots.txt` allows only `/palavra/` and `/og/`,** since some preview bots honour it, and the pages still say `noindex` (`robots.index` in `vite.config.ts`). Set that to `true` when the site should appear in search.
- **Previews are cached by the apps.** Slack and iMessage keep what they first saw, so test a design change on a new URL or a query string.

## Pronunciation

`GET /api/words/:word/audio` finds a recording on Wikimedia Commons (no key): a `Pt-br-` file first, then a Lingua Libre recording, then a `Pt-pt-` file. It runs only when someone presses play, for words in the database, and is remembered (30 days when found, 1 day when not). On a 429 it pauses for as long as Commons asks and answers 503, and the button falls back to the device's own pt-BR voice, labelled as synthetic. Audio plays straight from `upload.wikimedia.org`, which the page CSP allows. Recordings are under CC licences that require credit, so the page shows the speaker, licence and a link after playing. Commons limits by IP and asks clients to identify themselves: set `SITE_URL` so the requests carry the site's address.

**Deploy checklist.** Serve over HTTPS; set `NODE_ENV=production`, `CORS_ORIGINS`, `TRUST_PROXY` (number of proxies); put MySQL behind TLS (`DB_SSL=true`) if it is not on the same host; keep `.env` out of images and CI logs (use your platform's secret store); back up the database encrypted. Rate-limit counters are in-memory, so use a shared store if you run several instances. Rotating `PASSWORD_PEPPER` invalidates existing passwords; rotate `RLS_SECRET` by changing it in `.env` and running `pnpm db:migrate`.

Not built yet: e-mail verification and password reset (they need an e-mail provider), and 2FA.

## API

Cookie-authenticated JSON. Errors are `{ "error": "<code>" }`.

| | |
| --- | --- |
| `GET /api/health`, `GET /api/sources` | public |
| `GET /api/words/search?q=&limit=` | autocomplete (accent/case-insensitive) |
| `GET /api/words/:word` | entry: senses, glosses, examples, synonyms, antonyms, tags, sources |
| `POST /api/auth/register` `{email,password,name}` · `/login` `{email,password}` · `/logout` · `GET /me` | session |
| `GET/PATCH /api/me` · `PATCH /api/me/settings` | profile, tips, interests, dictionaries |
| `GET/POST /api/me/saved` `{word}` · `DELETE /api/me/saved/:id` | saved words |
| `GET/POST/DELETE /api/me/searches` | search history |
| `GET /api/me/sessions` · `DELETE /api/me/sessions[/:id]` | devices |
| `POST /api/me/password` · `GET /api/me/export` · `POST /api/me/delete-account` | account |

## How the React app uses it

`src/lib/api.ts` is the only place that calls the API (same-origin `/api`; Vite proxies it to `API_PORT`, default 3001, in development). `src/lib/session.tsx` holds the signed-in user, their settings and saved words, and `src/lib/words.ts` merges lookups with the curated entries. In production, serve the site and `/api` from the same origin (a reverse proxy) so the `HttpOnly` session cookie stays first-party.
