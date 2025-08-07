# Supabase PostgreSQL Setup

## Step 1: Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Sign up with GitHub
3. Create a new project

## Step 2: Get Database Connection Details
1. In your Supabase project, go to **Settings** → **Database**
2. Copy these details:
   - Host: `db.your-project-ref.supabase.co`
   - Database: `postgres`
   - Port: `5432`
   - User: `postgres`
   - Password: (your database password)

## Step 3: Import Your Database Schema
1. Go to **SQL Editor** in Supabase
2. Copy and paste your schema from `src/database/schema.sql`
3. Run the SQL to create your tables

## Step 4: Import Your Data
You can either:
- Use the SQL Editor to insert data
- Use a tool like pgAdmin to connect and import
- Use the migration script: `node migrate-db.js`

## Step 5: Set Firebase Environment Variables
1. In Firebase Console, go to **Functions** → **Configuration**
2. Add these variables:
   ```
   DB_USER=postgres
   DB_HOST=db.your-project-ref.supabase.co
   DB_NAME=postgres
   DB_PASSWORD=your_supabase_password
   DB_PORT=5432
   ```

## Step 6: Deploy
```bash
firebase deploy --only functions
npm run build
firebase deploy --only hosting
```

Your app will work with PostgreSQL in the cloud! 🎉 