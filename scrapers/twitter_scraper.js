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

const Tweet = require('./Tweet');

let links = [];
function getLinks() {

  let sql = "SELECT id, link FROM articles WHERE timestamp > ? ORDER BY date DESC LIMIT 500";
  let inserts = [0];
  sql = mysql.format(sql, inserts);

  return new Promise((resolve, reject) => {
    pool.query(sql, (error, results, fields) => {
      if (error) throw error;
      resolve(results);
    })
  });

}

function getTweets(link, article_data) {
  query = link;
  client.get('search/tweets', {q: query, result_type: "recent", count: "100", exclude:"retweets" } ,(error, tweets, response) => {
    if(error) {console.log(response); throw error;}
    tweets.statuses.forEach( tweet_data => {
      // console.log(tweet_data.user.screen_name + " -- " + tweet_data.text + "(" +  tweet_data.created_at + ")");
      let tweet = new Tweet();
      tweet.setArticleData(article_data);
      tweet.setTwitterData(tweet_data);
      tweet.manageUpdate();
    });

  });
}

function checkExists() {

}

function add() {

}

getTweetList();
function getTweetList() {
  getLinks().then(links => {
    let i = 0;
    let interval = setInterval(() => {
      if(i >= links.length) {
        clearInterval(interval);
        getTweetList();
      }
      else {
        console.log("------------------------------------------------");
        console.log(links[i].link);
        getTweets(links[i].link ,links[i]);
        i++;
      }
    }, 5000);
  });
}
