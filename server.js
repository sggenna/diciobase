const express = require('express');
const cors = require('cors');
const { query, testConnection } = require('./src/database/connection');

const app = express();
const PORT = process.env.PORT || 3001;


app.use(cors());
app.use(express.json());


app.get('/api/test', async (req, res) => {
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

app.get('/api/toponyms', async (req, res) => {
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

// Search toponyms
app.get('/api/toponyms/search', async (req, res) => {
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

// Get toponym by ID
app.get('/api/toponyms/:id', async (req, res) => {
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

app.get('/api/toponyms/:id/details', async (req, res) => {
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 