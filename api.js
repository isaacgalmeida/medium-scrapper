require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:8000';

app.get('/scrapper', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: 'Query parameter "url" is required' });
  }
  
  try {
    console.log(`Obtendo HTML completo para a URL: ${url}`);
    // Monta a URL do endpoint /html do servidor de bypass
    const endpoint = `${SERVER_URL}/html?url=${encodeURIComponent(url)}`;
    console.log(`Chamando endpoint: ${endpoint}`);
    
    const response = await axios.get(endpoint, { timeout: 10000 });
    const fullHTML = response.data;
    
    res.set('Content-Type', 'text/html');
    return res.send(fullHTML);
  } catch (error) {
    console.error("Erro no endpoint /scrapper:", error.message);
    return res.status(500).json({ error: 'Failed to scrape the URL' });
  }
});

app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});
