# DicioBase – Demo mode (no DB, no cost)

Use the **demo backend** to showcase the app without a database or paid services.

## Run the demo locally

1. **Start the demo API** (serves static data from `demo-data.json` on port 3001):

   ```bash
   npm run server:demo
   ```

2. **In another terminal, start the React app**:

   ```bash
   npm start
   ```

   Or run both together:

   ```bash
   npm run dev:demo
   ```

3. Open http://localhost:3000 — the app will use the demo backend at http://localhost:3001.

## What’s included

- **`server-demo.js`** – Express server with no PostgreSQL. Serves:
  - `GET /toponyms` – list all demo toponyms
  - `GET /searchToponyms?q=...` – search by lema/categoria/estrutura
  - `GET /pronunciation?lema=...` – pronunciation API (pt-BR TTS, proxied free); the app uses this in demo and falls back to browser speech synthesis if unavailable
- **`demo-data.json`** – Static toponyms (Paranaguá, Araguaia, Curitiba, Santos, Iguaçu). Edit this to add or change demo entries.

## Deploying the demo on Supabase

When the demo is hosted on **Supabase**, the app reads toponyms directly from your Supabase database (no separate API server).

1. **Create the toponyms view in Supabase**  
   In the [Supabase Dashboard](https://supabase.com/dashboard) → SQL Editor, run the contents of **`supabase-demo-view.sql`**. That creates the `toponyms_view` view the app expects.

2. **Set environment variables** for the build (e.g. in Supabase Hosting or your CI):
   - `REACT_APP_SUPABASE_URL` – your project URL (e.g. `https://xxxxx.supabase.co`)
   - `REACT_APP_SUPABASE_ANON_KEY` – your project’s anon/public key  

   With these set, the app uses the Supabase client for toponyms and search; pronunciation uses the browser’s speech synthesis (no backend needed).

3. **Build and deploy** the React app (e.g. `npm run build` then deploy the `build` folder to Supabase Hosting or any static host).

## Deploying on Vercel

### Full static demo (no Supabase, no API) – recommended for showcase

Deploy to Vercel **without** setting any env vars. The app will:

- Show **5 demo toponyms** (Paranaguá, Araguaia, Curitiba, Santos, Iguaçu)
- **Search** over that list
- **Pronunciation** via the browser’s pt-BR speech (click the speaker icon)
- **Dark/light mode**, **microestrutura** toggle – everything works

**Steps:** Push your repo, import the project on Vercel, deploy. Do **not** add `REACT_APP_SUPABASE_URL` or `REACT_APP_SUPABASE_ANON_KEY`. If you already added them, remove them in Vercel → Settings → Environment Variables, then redeploy.

Optional: set **`REACT_APP_USE_STATIC_DEMO=true`** on Vercel to force this mode even if Supabase vars are present.

### Using Supabase on Vercel

**.env is only for local.** On Vercel you must set the same variables in the dashboard so the build gets them.

### Make Supabase work on Vercel

1. **Create the view in Supabase**  
   In [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**, run the full contents of **`supabase-demo-view.sql`** (creates `toponyms_view` and `GRANT SELECT ... TO anon`). If you see "relation verbete does not exist", use the commented alternative at the bottom of that file (quoted table names).

2. **Add env vars in Vercel**  
   Vercel → your project → **Settings** → **Environment Variables**. Add:
   - **Name:** `REACT_APP_SUPABASE_URL`  
     **Value:** `https://pkbozezsifmrdkyancpv.supabase.co` (no spaces)
   - **Name:** `REACT_APP_SUPABASE_ANON_KEY`  
     **Value:** your full anon key from Supabase (Project Settings → API → anon public; paste the entire string).

   Apply to **Production** (and **Preview** if you want). Save.

3. **Redeploy**  
   **Deployments** → open the three dots on the latest deployment → **Redeploy**. New builds use the env vars you just set.

After that, the app on Vercel will connect to Supabase. If it still shows an error, the app will now display the real Supabase message (e.g. view missing or permission denied).

### First-time Vercel setup

1. **Push your repo to GitHub** (if you haven’t already).

2. **Import the project in Vercel**  
   [vercel.com](https://vercel.com) → **Add New** → **Project** → import your repo.

3. **Set environment variables** (see “Make Supabase work on Vercel” above).

4. **Deploy**  
   Trigger a deploy (or push to main). The app will use Supabase for toponyms and browser TTS for pronunciation.

### Doing the rest from here (terminal / Cursor)

After you’ve added the new project on Vercel (imported the repo once), you can do everything else from this project:

1. **Link this folder to your Vercel project** (one-time):
   ```bash
   npx vercel link
   ```
   Choose your Vercel account and the project you just created.

2. **Add environment variables** (one-time, or when you change them):
   ```bash
   npx vercel env add REACT_APP_SUPABASE_URL
   ```
   When prompted, paste your Supabase URL (e.g. `https://xxxxx.supabase.co`) and choose **Production** (and Preview if you want).

   ```bash
   npx vercel env add REACT_APP_SUPABASE_ANON_KEY
   ```
   Paste your Supabase anon key and choose **Production** (and Preview if you want).

3. **Deploy** (whenever you want to push an update):
   ```bash
   npm run deploy:vercel
   ```
   Or: `npx vercel --prod`

After the first deploy, you can also just **push to your main branch** and Vercel will redeploy automatically (if the project is connected to Git).

## Other deployment options

- **Frontend only (Firebase Hosting):** Build and deploy; point the app at a deployed demo API or use Supabase env vars as above.
- **Backend + frontend:** Deploy `server-demo.js` to a free Node host (e.g. [Render](https://render.com), [Railway](https://railway.app)), set `REACT_APP_API_URL` to that URL if needed, then build and deploy the frontend.
