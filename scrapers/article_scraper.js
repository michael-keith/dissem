const request = require('request');
const parseString = require('xml2js').parseString;

const Article = require('./Article');

const url_data = require('./scraper_data.json');

url_data.forEach( metadata => {
  request(metadata.url, (error, response, body) => {
    parseString(body, (err, result) => {
      result.rss.channel[0].item.forEach( article_data => {
        let article = new Article();
        article.setArticleData(article_data);
        article.setMetadata(metadata);
        article.setDate();
        article.manageUpdate();
      });
    });
  });
});
