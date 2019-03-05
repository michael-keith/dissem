require('dotenv').config();

const mysql = require('mysql');
const pool = mysql.createPool({
  connectionLimit : 10,
  host            : process.env.DB_HOST,
  user            : process.env.DB_USER,
  password        : process.env.DB_PASS,
  database        : process.env.DB_DATABASE,
  charset : 'utf8mb4'
});

class Tweet {

  constructor() {}

  setArticleData(data) {
    this.articleData = data;
  }

  setTwitterData(data) {
    this.twitterData = data;
    this.twitterData.date = new Date(data.created_at);
    this.twitterData.timestamp = this.twitterData.date.getTime() / 1000;
  }

  manageUpdate() {
    this.checkExists().then(result => {
      if(!result) {
        console.log("ADDING TWEET: " + this.twitterData.text);
        this.initialAdd();
      }
      else {
        console.log("ALREADY EXISTS: " + this.twitterData.text)
      };
    }).catch((err) => setImmediate(() => { throw err; }));
  }

  checkExists() {
    let sql = "SELECT * FROM twitter WHERE twitter_id = ?"
    let inserts = [this.twitterData.id_str];
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
    let sql = "INSERT INTO twitter(article_id, twitter_id, link, screen_name, text, date, timestamp) VALUES(?,?,?,?,?,?,?)";
    let inserts = [this.articleData.id, this.twitterData.id_str, this.articleData.link, this.twitterData.user.screen_name, this.twitterData.text, this.twitterData.date, this.twitterData.timestamp];
    sql = mysql.format(sql, inserts);
    pool.query(sql, error => {if (error) throw error;});
  }

  update() {

  }

}

module.exports = Tweet;