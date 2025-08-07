const { testConnection } = require('./src/database/connection');

async function testDB() {
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      console.log('✅ Database connection successful!');
    } else {
      console.log('❌ Database connection failed!');
    }
  } catch (error) {
    console.error('Error testing database:', error);
  }
  process.exit(0);
}

testDB(); 