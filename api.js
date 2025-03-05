require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const API_BEARER_TOKEN = process.env.API_BEARER_TOKEN; // Token definido no .env
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:8000';

// Middleware para autenticação Bearer
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No Bearer token provided' });
  }
  const token = authHeader.substring(7).trim();
  if (token !== API_BEARER_TOKEN) {
    return res.status(403).json({ error: 'Invalid token' });
  }
  next();
});

// Endpoint /scrape: recebe uma URL via query parameter e chama o endpoint /cookies do servidor
app.get('/scrape', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: 'Query parameter "url" is required' });
  }
  
  try {
    console.log(`Obtendo cookies para a URL: ${url}`);
    // Monta a URL do endpoint /cookies usando a URL enviada
    const endpoint = `${SERVER_URL}/cookies?url=${encodeURIComponent(url)}`;
    console.log(`Chamando o endpoint: ${endpoint}`);
    
    const response = await axios.get(endpoint, { timeout: 10000 });
    // Retorna o JSON recebido do servidor
    return res.json(response.data);
  } catch (error) {
    console.error("Erro ao buscar os cookies:", error.message);
    return res.status(500).json({ error: 'Failed to fetch cookies' });
  }
});

app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});
