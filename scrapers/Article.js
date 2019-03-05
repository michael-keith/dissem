require('dotenv').config();

const mysql = require('mysql');
const pool = mysql.createPool({
  connectionLimit : 10,
  host            : process.env.DB_HOST,
  user            : process.env.DB_USER,
  password        : process.env.DB_PASS,
  database        : process.env.DB_DATABASE
});

class Article {
  constructor() {
  }

  setArticleData(article_data) {
    this.article_data = article_data;
  }

  setMetadata(metadata) {
    this.metadata = metadata;
  }

  setDate(date = false) {
    if(!date) {date = this.article_data.pubDate};
    this.date = new Date(date);
    this.timestamp = this.date.getTime() / 1000;
  }

  manageUpdate() {
    this.checkExists().then(result => {
      if(!result) {
        console.log("ADDING ARTICLE: " + this.article_data.title[0]);
        this.initialAdd();
      }
      else { console.log("ALREADY EXISTS: " + this.article_data.title[0]) };
    }).catch((err) => setImmediate(() => { throw err; }));
  }

  checkExists() {
    let sql = "SELECT * FROM articles WHERE title = ? and link = ?"
    let inserts = [this.article_data.title[0], this.article_data.link];
    sql = mysql.format(sql, inserts);
    return new Promise((resolve, reject) => {
      pool.query(sql, (error, results, fields) => {
        if (error) throw error;
        if(results[0]) { resolve(true); }
        else { resolve(false); }
      })
    });
  }

  initialAdd() {
    let sql = "INSERT INTO articles(source, title, link, category, date, timestamp) VALUES(?,?,?,?,?,?)";
    let inserts = [this.metadata.source, this.article_data.title[0], this.article_data.link, this.metadata.category, this.date, this.timestamp];
    sql = mysql.format(sql, inserts);
    pool.query(sql, error => {if (error) throw error;});
  }

};

module.exports = Article;
