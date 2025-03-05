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
    console.log("Página carregada, aguardando o elemento via XPath...");

    const xpathExpression = '/html/body/div[3]';
    // Aguarda até que o elemento seja encontrado usando waitForFunction
    await page.waitForFunction(
      (xpath) => {
        return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue !== null;
      },
      { timeout: 60000 },
      xpathExpression
    );
    console.log("Elemento XPath encontrado, extraindo conteúdo...");

    // Obtém o elemento usando $x
    const elements = await page.$x(xpathExpression);
    if (elements.length === 0) {
      throw new Error("Elemento XPath não encontrado.");
    }

    // Extrai o HTML interno do elemento
    const contentHTML = await page.evaluate(el => el.innerHTML, elements[0]);

    console.log(`Scraper executado em ${new Date()}`);
    fs.writeFileSync("articles.json", JSON.stringify({ content: contentHTML }, null, 2), "utf-8");
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
