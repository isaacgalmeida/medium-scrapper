require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const API_BEARER_TOKEN = process.env.API_BEARER_TOKEN || 'abcd';
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

// Endpoint /scrape
// Recebe uma URL via query string e retorna o conteúdo HTML entre <html> e </html>
app.get('/scrape', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: 'Query parameter "url" is required' });
  }
  
  try {
    console.log(`Obtendo conteúdo para a URL: ${url}`);
    // Constrói a URL para o endpoint /html do servidor de bypass
    const endpoint = `${SERVER_URL}/html?url=${encodeURIComponent(url)}`;
    console.log(`Chamando endpoint: ${endpoint}`);
    
    const response = await axios.get(endpoint, { timeout: 10000 });
    const fullHTML = response.data;
    
    // Extrai a parte que começa com <html> e termina com </html>
    const startIndex = fullHTML.indexOf('<html>');
    const endIndex = fullHTML.lastIndexOf('</html>');
    if (startIndex === -1 || endIndex === -1) {
      return res.status(500).json({ error: 'HTML tags not found in response' });
    }
    
    const htmlContent = fullHTML.substring(startIndex, endIndex + 7);
    res.set('Content-Type', 'text/html');
    return res.send(htmlContent);
  } catch (error) {
    console.error('Erro no scraper:', error.message);
    return res.status(500).json({ error: 'Failed to scrape the URL' });
  }
});

app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});
