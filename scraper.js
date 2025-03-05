const puppeteer = require("puppeteer");
const fs = require("fs");
require("dotenv").config();

const INTERVAL_MINUTES = parseFloat(process.env.INTERVAL_MINUTES);

const scrapeArticles = async () => {
  const pageMedium = process.env.PAGE_MEDIUM;
  
  let browser;
  try {
    console.log("Iniciando o navegador...");
    browser = await puppeteer.launch({
      executablePath: "/usr/bin/google-chrome",
      args: ["--no-sandbox", "--start-maximized"],
    });

    const page = await browser.newPage();
    console.log(`Navegando até: ${pageMedium}`);
    await page.goto(pageMedium, { waitUntil: "networkidle2" });
    console.log("Página carregada, extraindo todo o HTML...");

    // Obtém todo o conteúdo HTML da página
    const fullHTML = await page.content();

    console.log(`Scraper executado em ${new Date()}`);
    fs.writeFileSync("page.html", fullHTML, "utf-8");
    console.log("Conteúdo HTML salvo em page.html");
  } catch (error) {
    console.error("Erro no scraper:", error);
  } finally {
    if (browser) {
      await browser.close();
      console.log("Navegador fechado.");
    }
  }
};

const startScraper = async () => {
  while (true) {
    console.log("Iniciando execução do scraper...");
    await scrapeArticles();
    console.log(`Aguardando ${INTERVAL_MINUTES} minutos antes de reiniciar o scraper.`);
    await new Promise((resolve) =>
      setTimeout(resolve, INTERVAL_MINUTES * 60 * 1000)
    );
  }
};

startScraper();
