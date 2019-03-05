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

let Twitter = require('twitter');
let client = new Twitter({
  consumer_key: process.env.TWITTER_CONUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

class TweetManager() {

  constructor() {

  }

  getLinks() {
    let sql = "SELECT id, link FROM articles WHERE timestamp > ? LIMIT 500";
    let inserts = [0];
    sql = mysql.format(sql, inserts);

    return new Promise((resolve, reject) => {
      pool.query(sql, (error, results, fields) => {
        if (error) throw error;
        resolve(results);
      })
    });
  }

  getTweetColletion(link, article_data) {
    query = link;

    return new Promise((resolve, reject) => {
      client.get('search/tweets', {q: query, result_type: "recent", count: "100", exclude:"retweets" }, function(error, tweet_colection, response) {
        if(error) {console.log(response); throw error;}
        resolve(results);
      });
    }
  }

}

module.exports = TweetManager;
