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

const TweetCollection = require('./TweetCollection');

function getArticles() {
  var timestamp = new Date().getTime();

  let sql = "SELECT id, link, source FROM articles WHERE timestamp > ? ORDER BY date DESC";
  let inserts = [ (timestamp/1000) - 259200];
  sql = mysql.format(sql, inserts);

  return new Promise((resolve, reject) => {
    pool.query(sql, (error, results, fields) => {
      if (error) throw error;
      resolve(results);
    })
  });
}

function getTweetCollection(article_data, max_id = "") {
  query = article_data.link;

  return new Promise((resolve, reject) => {
    client.get('search/tweets', {q: query, result_type: "recent", count: "100", exclude:"retweets", max_id: max_id} ,(error, tweets, response) => {
      if(error) {console.log(error) }
      // console.log(tweets);
      let tweet_collection = new TweetCollection(article_data, tweets);
      resolve(tweet_collection);
    });
  });
}

function wait(milleseconds) {
  return new Promise(resolve => setTimeout(resolve, milleseconds))
}

function initList() {
  getArticles().then(iterateList)
  .catch(console.error);
}

async function iterateList(articles) {
  while(articles.length) {
    console.log("------------------------------------------------------------");
    getTweetCollection(articles[0], articles[0].max_id).then( (tweet_collection ) => {
      console.log("Arr length: " + articles.length)
      console.log(articles[0].link + " | (Max id: " + articles[0].max_id + ")")
      return tweet_collection
    }).catch(console.error).then( tweet_collection => {
      article = articles[0]
      if(tweet_collection && tweet_collection.tweets.length > 0) {
        tweet_collection.updateTweets().then( post_data => {
          console.log(post_data)
          articles[0].max_id = post_data.max_id;
          articles.shift();
          if(post_data.len >= 100) {
            console.log("Rerun " + "(" + post_data.exists_perc + "%)")
            articles.unshift(article)
          }
        }).catch(console.error)
      }
      else {
        console.log("NO TWEETS");
        articles.shift()
      }
    })

    await wait(5000);
  }
  console.log("Done");
  initList();
}

initList();
