const puppeteer = require("puppeteer");
const fs = require("fs");
require("dotenv").config();

const INTERVAL_MINUTES = parseFloat(process.env.INTERVAL_MINUTES);

const scrapeArticles = async () => {
  const pageMedium = process.env.PAGE_MEDIUM;
  const numberOfArticles = parseInt(process.env.NUMBER_OF_ARTICLES, 10) || 1;

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
    console.log("Página carregada, aguardando o seletor do conteúdo...");

    // Seletor da div que contém o conteúdo do artigo
    const containerSelector =
      'div.container.w-full.pt-20.mx-auto.text-gray-900.break-words.bg-white.md\\:max-w-3xl.dark\\:text-gray-200.dark\\:bg-gray-800';

    await page.waitForSelector(containerSelector, { timeout: 60000 });
    console.log("Seletor encontrado, extraindo conteúdo...");

    // Extrai o HTML do(s) container(es)
    const articles = await page.evaluate((numberOfArticles, selector) => {
      const containers = Array.from(document.querySelectorAll(selector));
      return containers.slice(0, numberOfArticles).map((el) => el.innerHTML);
    }, numberOfArticles, containerSelector);

    console.log(`Artigos extraídos com sucesso em ${new Date()}`);
    fs.writeFileSync("articles.json", JSON.stringify(articles, null, 2), "utf-8");
    console.log("Conteúdo salvo em articles.json");
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
