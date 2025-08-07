const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const { Pool } = require('pg');

// Database configuration
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'dictionary_db',
  password: process.env.DB_PASSWORD || 'your_actual_password_here',
  port: process.env.DB_PORT || 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

const pool = new Pool(dbConfig);

// Test connection function
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Database connection test successful');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error.message);
    return false;
  }
};

// Query function
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query execution error:', error);
    throw error;
  }
};

// API Functions
exports.test = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const isConnected = await testConnection();
      res.json({ 
        success: isConnected, 
        message: isConnected ? 'Database connected' : 'Database connection failed' 
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
});

exports.toponyms = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const result = await query(`
        SELECT
          V1.idVerbete,
          MAX(CASE WHEN E.deElemento = 'Lema' THEN V1.deVerbete END) AS Lema,
          MAX(CASE WHEN E.deElemento = 'Estrutura Morfológica' THEN V1.deVerbete END) AS Estrutura_Morfologica,
          MAX(CASE WHEN E.deElemento = 'Categoria Gramatical' THEN V1.deVerbete END) AS Categoria_Gramatical
        FROM Verbete V1
        JOIN Elemento E ON V1.idElemento = E.idElemento
        WHERE V1.idMicroestrutura = 1
        GROUP BY V1.idVerbete
        ORDER BY V1.idVerbete
      `);
      
      res.json({ success: true, data: result.rows });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
});

exports.searchToponyms = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { q } = req.query;
      if (!q) {
        return res.json({ success: true, data: [] });
      }

      const result = await query(`
        SELECT
          V1.idVerbete,
          MAX(CASE WHEN E.deElemento = 'Lema' THEN V1.deVerbete END) AS Lema,
          MAX(CASE WHEN E.deElemento = 'Estrutura Morfológica' THEN V1.deVerbete END) AS Estrutura_Morfologica,
          MAX(CASE WHEN E.deElemento = 'Categoria Gramatical' THEN V1.deVerbete END) AS Categoria_Gramatical
        FROM Verbete V1
        JOIN Elemento E ON V1.idElemento = E.idElemento
        WHERE V1.idMicroestrutura = 1
          AND EXISTS (
            SELECT 1 FROM Verbete V2 
            WHERE V2.idVerbete = V1.idVerbete 
              AND V2.idElemento = 1 
              AND V2.deVerbete ILIKE $1
          )
        GROUP BY V1.idVerbete
        ORDER BY V1.idVerbete
      `, [`%${q}%`]);
      
      res.json({ success: true, data: result.rows });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
});

exports.toponymById = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { id } = req.params;
      
      const result = await query(`
        SELECT
          V1.idVerbete,
          MAX(CASE WHEN E.deElemento = 'Lema' THEN V1.deVerbete END) AS Lema,
          MAX(CASE WHEN E.deElemento = 'Estrutura Morfológica' THEN V1.deVerbete END) AS Estrutura_Morfologica,
          MAX(CASE WHEN E.deElemento = 'Categoria Gramatical' THEN V1.deVerbete END) AS Categoria_Gramatical
        FROM Verbete V1
        JOIN Elemento E ON V1.idElemento = E.idElemento
        WHERE V1.idMicroestrutura = 1 AND V1.idVerbete = $1
        GROUP BY V1.idVerbete
      `, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Toponym not found' });
      }
      
      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
});

exports.toponymDetails = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { id } = req.params;
      
      const result = await query(`
        SELECT
          T.deTipo AS TipoDicionario,
          D.deDicionario AS dicionario,
          M.deMicroestrutura AS microestrutura,
          E.deElemento AS Elemento,
          V.idVerbete AS idVerbete,
          V.deVerbete AS conteudo
        FROM Tipo T
        INNER JOIN TipoDicionario TD ON T.idTipo = TD.idTipo
        INNER JOIN Dicionario D ON TD.idDicionario = D.idDicionario
        INNER JOIN Microestrutura M ON D.idDicionario = M.idDicionario
        INNER JOIN ElementoMicroestrutura EM ON M.idMicroestrutura = EM.idMicroestrutura
        INNER JOIN Elemento E ON EM.idElemento = E.idElemento
        INNER JOIN Verbete V ON V.idMicroestrutura = EM.idMicroestrutura AND V.idElemento = EM.idElemento
        WHERE V.idVerbete = $1
        ORDER BY D.deDicionario, M.deMicroestrutura, E.idElemento, V.deVerbete
      `, [id]);
      
      res.json({ success: true, data: result.rows });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
}); 