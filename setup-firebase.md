# Firebase Setup Instructions

## Step 1: Upgrade to Blaze Plan (Required)
1. Go to [Firebase Console](https://console.firebase.google.com/project/diciobase/usage/details)
2. Click "Upgrade" to Blaze plan (pay-as-you-go, very cheap)
3. This is required for Firebase Functions to work with external databases

## Step 2: Set Up Cloud Database

### Option A: Google Cloud SQL (Recommended)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or use your existing Firebase project
3. Enable Cloud SQL API
4. Create a PostgreSQL instance:
   - Go to SQL → Create Instance
   - Choose PostgreSQL
   - Set up your database name, user, and password
   - Note down the connection details

### Option B: Supabase (Free tier available)
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your connection string from Settings → Database

### Option C: Railway PostgreSQL (Free tier)
1. Go to [railway.app](https://railway.app)
2. Create a new project
3. Add PostgreSQL database
4. Get connection details

## Step 3: Set Firebase Environment Variables
1. In Firebase Console, go to Functions → Configuration
2. Add these environment variables:
   ```
   DB_USER=your_db_user
   DB_HOST=your_db_host
   DB_NAME=your_db_name
   DB_PASSWORD=your_db_password
   DB_PORT=5432
   ```

## Step 4: Import Your Database
1. Use a tool like pgAdmin, DBeaver, or the command line
2. Connect to your cloud database
3. Import your database schema and data

## Step 5: Deploy Firebase Functions
```bash
firebase deploy --only functions
```

## Step 6: Deploy Your App
```bash
npm run build
firebase deploy --only hosting
```

Your app will be available at: https://diciobase.web.app 