require('dotenv').config();
const express = require('express');
const axios = require('axios');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;
const API_BEARER_TOKEN = process.env.API_BEARER_TOKEN || 'abcd';
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:8000';

// Middleware para autenticação via Bearer
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

// Endpoint /scrape: recebe uma URL via query e retorna o HTML entre <html> e </html>
app.get('/scrape', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: 'Query parameter "url" is required' });
  }
  
  try {
    console.log(`Obtendo cookies para a URL: ${url}`);
    // Chama o endpoint /cookies para obter os cookies e o user agent
    const cookiesEndpoint = `${SERVER_URL}/cookies?url=${encodeURIComponent(url)}`;
    console.log(`Chamando endpoint de cookies: ${cookiesEndpoint}`);
    const cookieResponse = await axios.get(cookiesEndpoint, { timeout: 10000 });
    const { cookies, user_agent } = cookieResponse.data;
    console.log("Cookies recebidos:", cookies);
    console.log("User-Agent recebido:", user_agent);
    
    // Lança o Puppeteer e configura a página
    console.log("Iniciando o Puppeteer...");
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent(user_agent);
    
    // Prepara os cookies para injeção
    const parsedUrl = new URL(url);
    const cookieArray = Object.entries(cookies).map(([name, value]) => ({
      name,
      value,
      domain: parsedUrl.hostname,
      path: "/"
    }));
    console.log("Injetando cookies:", cookieArray);
    await page.setCookie(...cookieArray);
    
    console.log(`Navegando até: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    console.log("Página carregada, extraindo conteúdo...");
    
    const fullHTML = await page.content();
    await browser.close();
    console.log("Navegador fechado.");
    
    // Extrai a parte do HTML entre <html> e </html>
    const startIndex = fullHTML.indexOf('<html>');
    const endIndex = fullHTML.lastIndexOf('</html>');
    if (startIndex === -1 || endIndex === -1) {
      return res.status(500).json({ error: 'HTML tags not found in response' });
    }
    const htmlContent = fullHTML.substring(startIndex, endIndex + 7);
    
    res.set('Content-Type', 'text/html');
    return res.send(htmlContent);
  } catch (error) {
    console.error("Erro no /scrape:", error.message);
    return res.status(500).json({ error: 'Failed to scrape the URL' });
  }
});

app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});
