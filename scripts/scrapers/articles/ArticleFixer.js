require('dotenv').config();

const fetch = require('node-fetch');
const extractor = require('unfluff')

const Article = require('./Article')

const mysql = require('mysql');
const pool = mysql.createPool({
  connectionLimit : 10,
  host            : process.env.DB_HOST,
  user            : process.env.DB_USER,
  password        : process.env.DB_PASS,
  database        : process.env.DB_DATABASE
});

class ArticleFixer {

  constructor() {
    this.getArticles = this.getArticles.bind(this)
  }

  async fix() {
    await this.getList()
    .then(this.getArticles)
  }

  getList() {
    let sql = "SELECT COUNT(twitter.link) as total, twitter.source, twitter.link FROM twitter LEFT JOIN articles ON twitter.link = articles.link WHERE articles.title IS NULL GROUP BY twitter.link ORDER BY total DESC LIMIT 50"
    return new Promise((resolve, reject) => {
      pool.query(sql, (error, results, fields) => {
        if (error) throw error
        else resolve(results)
      })
    })
  }

  async getArticles(list) {
    for(let item of list) {
      console.log(item.link)
      let response = await fetch(item.link)
      let html = await response.text()
      let data = extractor.lazy(html, 'en')

      let article = new Article()
      article.setSource(item.source)
      article.setTitle(data.title())
      article.setLink(item.link)
      article.setCategory(item.category)
      article.setDate(data.date())
      article.manageUpdate()

      await this.wait(2000)
    }
  }

  wait(milleseconds) {
    console.log("waiting...")
    return new Promise(resolve => setTimeout(resolve, milleseconds))
  }

}

let a = new ArticleFixer
a.fix()

module.exports = ArticleFixer
