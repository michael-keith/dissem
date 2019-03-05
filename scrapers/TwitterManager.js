require('dotenv').config();

let mysql = require('mysql');
let pool  = mysql.createPool({
  connectionLimit : 10,
  host            : process.env.DB_HOST,
  user            : process.env.DB_USER,
  password        : process.env.DB_PASS,
  database        : process.env.DB_DATABASE,
  charset : 'utf8mb4'
});

const TweetCollection = require('./TweetCollection');

class TwitterManager {

  constructor() {
  }

  manage() {
    this.getArticlesData().then(results => {
      this.getTweetCollection().then( () => {
        this.manage();
      });
    })
  }

  getArticlesData() {
    let sql = "SELECT id, link FROM articles WHERE timestamp > ? LIMIT 2";
    let inserts = [0];
    sql = mysql.format(sql, inserts);

    return new Promise((resolve, reject) => {
      pool.query(sql, (error, results, fields) => {
        if (error) throw error;
        this.articles_data = results;
        resolve(results);
      })
    });
  }

  getTweetCollection() {
    return new Promise((resolve, reject) => {
      let i = 0;
      let interval = setInterval(() => {
        if(i >= this.articles_data.length -1) {
          clearInterval(interval);
          resolve();
        }
        console.log( i + ": " + this.articles_data[i].link );
        let tc = new TweetCollection(this.articles_data[i]);
        tc.manageCollection().then( () => {
          console.log("Tweet collection promise filled.");
        });
        i++;
      }, 5000);
    });
  }

}

module.exports = TwitterManager;
