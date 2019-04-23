require('dotenv').config();

const request = require('request')
const parseString = require('xml2js').parseString

const Article = require('./Article')

const url_data = require('./scraper_data.json')

function get_articles( metadata ) {
  request(metadata.url, (error, response, body) => {
    parseString(body, (err, result) => {
      if(result && result.rss.channel[0].item) {
        result.rss.channel[0].item.forEach( article_data => {
          let article = new Article()
          article.setSource(metadata.source)
          article.setTitle(article_data.title[0])
          article.setLink(article_data.link)
          article.setCategory(metadata.category)
          article.setDate(article_data.pubDate)
          article.manageUpdate()
        })
      }
    })
  })
}

url_data.forEach(get_articles)
setInterval( () => {
  url_data.forEach(get_articles)
  console.log("Last run" + new Date())
}, 700000)
