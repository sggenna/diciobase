# Railway Deployment Instructions

## Step 1: Set up Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create a new project

## Step 2: Add PostgreSQL Database
1. Click "New Service" → "Database" → "PostgreSQL"
2. Note down the connection details (you'll need them for environment variables)

## Step 3: Deploy Your App
1. Click "New Service" → "GitHub Repo"
2. Connect your GitHub repository
3. Railway will automatically detect it's a Node.js app

## Step 4: Set Environment Variables
In your Railway project, go to "Variables" tab and add:

```
DB_USER=postgres
DB_HOST=your-railway-db-host
DB_NAME=railway
DB_PASSWORD=your-railway-db-password
DB_PORT=5432
PORT=3001
```

Replace the values with your actual Railway PostgreSQL connection details.

## Step 5: Import Your Database
1. Get your database connection string from Railway
2. Use a tool like pgAdmin or DBeaver to connect
3. Import your database schema and data

## Step 6: Deploy
Railway will automatically deploy when you push to your GitHub repository.

Your app will be available at the URL provided by Railway! 