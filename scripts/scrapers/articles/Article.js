require('dotenv').config();

const mysql = require('mysql');
const pool = mysql.createPool({
  connectionLimit : 100,
  host            : process.env.DB_HOST,
  user            : process.env.DB_USER,
  password        : process.env.DB_PASS,
  database        : process.env.DB_DATABASE
})

const sources = require('../json/sources.json')

class Article {
  constructor() {
  }

  setTitle(title) {
    this.title = title
  }

  setSource(source) {
    this.source = source
  }

  setLink(link) {
    this.link = link[0]
    sources.forEach( (source) => {
      if(source.conversion) {this.link = this.link.replace(new RegExp(source.conversion.pattern, 'i'), source.conversion.output)}
    })
  }

  setDate(date = false) {
    if( new Date(date) != "Invalid Date" ) {
      this.date = new Date(date)
      this.timestamp = this.date.getTime() / 1000
    }
  }

  add() {
    let sql = "INSERT IGNORE INTO articles(source, title, link, date, timestamp) VALUES(?,?,?,?,?)";
    let inserts = [this.source, this.title, this.link, this.date, this.timestamp];
    sql = mysql.format(sql, inserts);
    pool.query(sql, error => {if (error) console.log(error)})
  }

}

module.exports = Article;
