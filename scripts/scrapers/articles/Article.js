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

  setTitle(title) {
    this.title = title
  }

  setSource(source) {
    this.source = source
  }

  setLink(link) {
    this.link = link
  }

  setCategory(category) {
    this.category = category
  }

  setDate(date = false) {
    if( new Date(date) != "Invalid Date" ) {
      this.date = new Date(date)
      this.timestamp = this.date.getTime() / 1000
    }
  }

  manageUpdate() {
    this.checkExists().then(result => {
      if(!result) {
        console.log("ADDING ARTICLE: " + this.title);
        this.initialAdd();
      }
      else {
        console.log("ALREADY EXISTS: " + this.title)
      };
    }).catch((err) => setImmediate(() => { throw err; }));
  }

  checkExists() {
    let sql = "SELECT * FROM articles WHERE link = ?"
    let inserts = [this.link];
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
    let sql = "INSERT IGNORE INTO articles(source, title, link, date, timestamp) VALUES(?,?,?,?,?)";
    let inserts = [this.source, this.title, this.link, this.date, this.timestamp];
    sql = mysql.format(sql, inserts);
    pool.query(sql, error => {
      if (error) console.log(error)
    });
  }

};

module.exports = Article;
