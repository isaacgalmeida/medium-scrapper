require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const API_BEARER_TOKEN = process.env.API_BEARER_TOKEN; // Token definido no .env

// Middleware para autenticação Bearer
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No Bearer token provided' });
  }
  const token = authHeader.substring(7).trim();
  console.log(token)
  if (token !== API_BEARER_TOKEN) {
    return res.status(403).json({ error: 'Invalid token' });
  }
  next();
});

// Endpoint para obter o conteúdo HTML da página
app.get('/scrape', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: 'Query parameter "url" is required' });
  }

  try {
    console.log(`Obtendo URL: ${url}`);
    // Faz a requisição HTTP para obter o HTML da página
    const response = await axios.get(url, { timeout: 10000 });
    const fullHTML = response.data;

    // Extrai a parte que começa com <html> e termina com </html>
    const startIndex = fullHTML.indexOf('<html>');
    const endIndex = fullHTML.lastIndexOf('</html>');
    if (startIndex === -1 || endIndex === -1) {
      return res.status(500).json({ error: 'HTML not found in the response' });
    }
    const htmlContent = fullHTML.substring(startIndex, endIndex + 7);

    res.set('Content-Type', 'text/html');
    return res.send(htmlContent);
  } catch (error) {
    console.error("Erro ao buscar a URL:", error.message);
    return res.status(500).json({ error: 'Failed to scrape the URL' });
  }
});

app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});
