require('dotenv').config();
const fs = require('fs');
const axios = require('axios');

const INTERVAL_MINUTES = parseFloat(process.env.INTERVAL_MINUTES) || 10;
const PAGE_MEDIUM = process.env.PAGE_MEDIUM;
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:8000';

async function scrapePage() {
  try {
    console.log("Iniciando scraper usando o modo server para bypass do Cloudflare...");
    // Constrói a URL do endpoint, codificando a URL da página a ser raspada
    const endpoint = `${SERVER_URL}/html?url=${encodeURIComponent(PAGE_MEDIUM)}`;
    console.log(`Chamando o endpoint: ${endpoint}`);

    const response = await axios.get(endpoint, { timeout: 10000 });
    const html = response.data;
    
    const outputFile = "article.html";
    fs.writeFileSync(outputFile, html, "utf-8");
    console.log(`Conteúdo salvo em ${outputFile} em ${new Date().toLocaleString()}`);
  } catch (error) {
    console.error("Erro no scraper:", error.message);
  }
}

async function mainLoop() {
  while (true) {
    console.log("Iniciando execução do scraper...");
    await scrapePage();
    console.log(`Aguardando ${INTERVAL_MINUTES} minutos antes de reiniciar o scraper.`);
    await new Promise(resolve => setTimeout(resolve, INTERVAL_MINUTES * 60 * 1000));
  }
}

mainLoop();
