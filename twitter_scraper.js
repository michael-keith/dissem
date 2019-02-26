require('dotenv').config();

let mysql = require('mysql');
let pool  = mysql.createPool({
  connectionLimit : 10,
  host            : process.env.DB_HOST,
  user            : process.env.DB_USER,
  password        : process.env.DB_PASS,
  database        : 'mkeit001_dissem'
});

let Twitter = require('twitter');
let client = new Twitter({
  consumer_key: process.env.TWITTER_CONUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

let links = [];
function getLinks() {

  let sql = "SELECT link FROM articles WHERE timestamp > ?";
  let inserts = [0];
  sql = mysql.format(sql, inserts);

  pool.query(sql, function (error, results, fields) {
    links = results;

    if (error) throw error;
  });

}

function getTweets(link) {
  query = link;
  client.get('search/tweets', {q: query, result_type: "recent", count: "100"} ,function(error, tweets, response) {
    if(error) {console.log(response); throw error;}
    console.log(tweets);
    // tweets.forEach(function(tweet) {
    //   console.log(tweet.text);
    // });

  });
}

setInterval(function(){ getLinks(); }, 2000);

setInterval(function(){
  links.forEach( function(link) {

    setInterval(function(){ getTweets(link.link) }, 5000);

  });
}, 10000);
