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

// Endpoint /scrape: recebe uma URL e retorna o HTML entre <html> e </html>
// Faz a chamada para o endpoint /cookies e injeta os dados no GET para a URL fornecida.
app.get('/scrape', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: 'Query parameter "url" is required' });
  }

  try {
    console.log(`Obtendo cookies para a URL: ${url}`);
    // Chama o endpoint /cookies para obter os cookies e o user agent
    const cookiesEndpoint = `${SERVER_URL}/cookies?url=${encodeURIComponent(url)}`;
    console.log(`Chamando o endpoint de cookies: ${cookiesEndpoint}`);
    const cookiesResponse = await axios.get(cookiesEndpoint, { timeout: 10000 });
    const { cookies, user_agent } = cookiesResponse.data;

    // Constrói o header Cookie a partir do objeto de cookies
    let cookieStr = Object.entries(cookies)
      .map(([name, value]) => `${name}=${value}`)
      .join('; ');

    console.log("Cookies obtidos:", cookieStr);
    console.log("User-Agent obtido:", user_agent);
    console.log("Realizando chamada para a URL com os headers injetados...");

    // Faz a requisição GET para a URL utilizando os headers injetados
    const pageResponse = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': user_agent,
        'Cookie': cookieStr
      }
    });

    const fullHTML = pageResponse.data;
    const startIndex = fullHTML.indexOf('<html>');
    const endIndex = fullHTML.lastIndexOf('</html>');
    if (startIndex === -1 || endIndex === -1) {
      return res.status(500).json({ error: 'HTML tags not found in response' });
    }
    const htmlContent = fullHTML.substring(startIndex, endIndex + 7);

    res.set('Content-Type', 'text/html');
    return res.send(htmlContent);
  } catch (error) {
    console.error("Erro ao processar scraping:", error.message);
    return res.status(500).json({ error: 'Failed to scrape the URL' });
  }
});

app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});
