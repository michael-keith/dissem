require('dotenv').config();

const request = require('request')
const parseString = require('xml2js').parseString

const mysql = require('mysql');
const pool = mysql.createPool({
  connectionLimit : 10,
  host            : process.env.DB_HOST,
  user            : process.env.DB_USER,
  password        : process.env.DB_PASS,
  database        : process.env.DB_DATABASE
});

const Article = require('./Article')

const url_data = require('./scraper_data.json')

async function get_articles( metadata ) {
  request(metadata.url, (error, response, body) => {
    parseString(body, (err, result) => {
      if(result && result.rss.channel[0].item) {
        result.rss.channel[0].item.forEach( article_data => {
          let article = new Article()
          article.setArticleData(article_data)
          article.setMetadata(metadata)
          article.setDate()
          article.manageUpdate()
        })
      }
    })
  })
}

function remove_dupes() {
  console.log("REMOVING DUPES...")
  let sql = "DELETE t1 FROM articles t1 INNER JOIN articles t2 WHERE t1.id > t2.id AND t1.link = t2.link"
  sql = mysql.format(sql)
  pool.query(sql, error => {if (error) throw error})
}

url_data.forEach(get_articles)
setInterval( () => {
  url_data.forEach(get_articles)
  remove_dupes()
}, 600000)
