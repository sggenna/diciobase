const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration - update these with your cloud database details
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'dictionary_db',
  password: process.env.DB_PASSWORD || 'your_password',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

const pool = new Pool(dbConfig);

async function migrateDatabase() {
  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    
    console.log('Connected successfully!');
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, 'src', 'database', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      console.log('Reading schema file...');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      console.log('Executing schema...');
      await client.query(schema);
      console.log('Schema executed successfully!');
    } else {
      console.log('Schema file not found, skipping...');
    }
    
    // You can add data import logic here
    // For example, if you have a data.sql file:
    // const dataPath = path.join(__dirname, 'data.sql');
    // if (fs.existsSync(dataPath)) {
    //   const data = fs.readFileSync(dataPath, 'utf8');
    //   await client.query(data);
    // }
    
    client.release();
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateDatabase();
}

module.exports = { migrateDatabase }; 