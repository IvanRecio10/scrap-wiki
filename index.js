const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = 3000;

const url = 'https://es.wikipedia.org/wiki/Categor%C3%ADa:M%C3%BAsicos_de_rap';

async function scrapePage(pageUrl) {
  try {
    const { data } = await axios.get(pageUrl);
    const $ = cheerio.load(data);

    const title = $('h1').text();

    const images = [];
    $('img').each((index, element) => {
      const imgUrl = $(element).attr('src');
      if (imgUrl) images.push(imgUrl);
    });

    const texts = [];
    $('p').each((index, element) => {
      const text = $(element).text().trim();
      if (text) texts.push(text);
    });

    return { title, images, texts };
  } catch (error) {
    console.error(`Error al scrapear la página ${pageUrl}:`, error);
    return null;
  }
}

async function scrapeWikipedia() {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const results = [];

    $('#mw-pages a').each(async (index, element) => {
      const relativeUrl = $(element).attr('href');
      if (relativeUrl) {
        const fullUrl = `https://es.wikipedia.org${relativeUrl}`;
        console.log(`Scraping: ${fullUrl}`);

        const pageData = await scrapePage(fullUrl);
        if (pageData) {
          results.push(pageData);
        }
      }
    });

    setTimeout(() => {
      console.log('Scraping finalizado. Resultados:', results);
    }, 5000);

    return results;
  } catch (error) {
    console.error('Error al scrapear Wikipedia:', error);
    return [];
  }
}

app.get('/', async (req, res) => {
  const data = await scrapeWikipedia();
  res.send(data);
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
