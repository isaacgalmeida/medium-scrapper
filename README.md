# Cloudflare Bypass Scraper (Node.js)

Este projeto utiliza um servidor em modo Cloudflare Bypass (executado via Docker) para contornar a proteção do Cloudflare e extrair o HTML renderizado de uma página. O scraper em Node.js faz requisições periódicas ao endpoint `/html` do servidor e salva o conteúdo retornado em um arquivo `article.html`.

## Pré-requisitos

- [Docker](https://www.docker.com/) instalado e em execução.
- [Node.js](https://nodejs.org/) (versão 12 ou superior) e npm instalados.
- (Opcional) Ambiente virtual para Node.js (por exemplo, [nvm](https://github.com/nvm-sh/nvm)).

## Instruções de Uso

### 1. Iniciar o Servidor de Bypass (Modo Server)

Utilize o container Docker fornecido para contornar a proteção do Cloudflare. Execute o comando abaixo para iniciar o container em modo detach, expondo a porta 8000:

```bash
docker run -d -p 8000:8000 ghcr.io/sarperavci/cloudflarebypassforscraping:latest
```

### 2. Configurar o Projeto

Clone ou copie este projeto para sua máquina e, na raiz do projeto, crie um arquivo `.env` com o seguinte conteúdo (ajuste os valores conforme necessário):

```dotenv
INTERVAL_MINUTES=10
PAGE_MEDIUM=https://freedium.cfd/https://medium.com/@dylan_combellick/suddenly-strangely-silent-6b3bcce55dc3
SERVER_URL=http://localhost:8000
```

### 3. Instalar Dependências

Abra um terminal na pasta do projeto e execute:

```bash
npm install
```

Isso instalará as dependências necessárias, conforme definido no `package.json` (axios e dotenv).

### 4. Executar o Scraper

Após iniciar o servidor Docker e configurar o projeto, execute o scraper:

```bash
node scraper.js
```

O scraper fará requisições periódicas ao endpoint `/html` do servidor e salvará o HTML renderizado no arquivo `article.html`.

## Estrutura do Projeto

```
/seu-projeto/
├── .env                  # Arquivo de configuração de ambiente (não versionado)
├── article.html          # Arquivo gerado com o HTML extraído (gerado em runtime)
├── node_modules/         # Dependências instaladas
├── package.json          # Configurações do projeto e dependências
├── package-lock.json     # Versões exatas das dependências
└── scraper.js            # Código principal do scraper
```

## Notas

- **Intervalo de Execução:**  
  O intervalo entre as execuções do scraper é definido pela variável `INTERVAL_MINUTES` no arquivo `.env`.

- **Modo Server:**  
  O servidor Docker utilizado fornece dois endpoints: `/cookies` e `/html`. Este projeto utiliza o endpoint `/html` para obter o conteúdo renderizado da página contornando a proteção do Cloudflare.

- **Timeout:**  
  O scraper utiliza um timeout de 10 segundos para as requisições HTTP. Se a requisição demorar mais do que isso, ocorrerá um erro e o scraper aguardará o intervalo definido para tentar novamente.

## Contribuição

Sinta-se à vontade para enviar issues ou pull requests para melhorar este projeto.

## Licença

Este projeto é distribuído sob a licença MIT.
