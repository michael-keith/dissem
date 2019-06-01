require('dotenv').config()
const util = require('util')
const delay = require('delay')
const request = require('request')

const sources = require('../json/sources.json')
let Tweet = require('./tweet')

///////////////////////////////////////////////
//MySql
///////////////////////////////////////////////
let mysql = require('mysql');
let pool  = mysql.createPool({
  connectionLimit : 100,
  host            : process.env.DB_HOST,
  user            : process.env.DB_USER,
  password        : process.env.DB_PASS,
  database        : process.env.DB_DATABASE,
  charset : 'utf8mb4'
})
pool.query = util.promisify(pool.query)

///////////////////////////////////////////////
//Twitter Setup
///////////////////////////////////////////////
const Twitter = require('twitter');

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
})

function get_articles() {
  let ts_min = (Math.floor(+new Date()/1000)) - 259200
  let sql = "SELECT count(*) as total, source, link FROM twitter WHERE link IS NOT NULL AND timestamp > ? GROUP BY link, source ORDER BY total DESC LIMIT 2500"
  let inserts = [ts_min]
  sql = mysql.format(sql, inserts)

  return pool.query(sql)
}

async function get_tweets(link, max_id) {
  return new Promise((resolve, reject) => {
    client.get('search/tweets', {q: link, result_type: "recent", count: "100", tweet_mode: "extended", include_entities: "true", result_type: "recent", max_id: max_id} ,(error, data, response) => {
      if(error) {console.log(error); throw error}
      resolve(data)
    })
  })
}

function unshorten(uri, source) {
  return new Promise((resolve, reject) => {
    request({uri: uri, followRedirect: false}, (err, httpResponse) => {
      if (err) {resolve(uri)}
      let url = httpResponse.headers.location
      if(source == "Daily Mail" && httpResponse.headers.location != undefined) {url = "https://www.dailymail.co.uk" + httpResponse.headers.location}
      resolve(url||uri)
    })
  })
}

(async function() {
  let article_index = 0
  let max_id = null
  let articles = null
  let link = null

  while(true) {
    console.log("NEW CYCLE...")
    articles = await get_articles()
    max_id = null
    while(articles.length > 0) {
      if(link == null) {console.log("Update Link"); link = await unshorten(articles[article_index].link, articles[article_index].source)}
      console.log("Articles in array: " + articles.length)
      console.log("Current max id: " + max_id)
      console.log("Article-ex: " + link)
      console.log("Article-or: " + articles[article_index].link)

      let tweets = await get_tweets(link, max_id)
      console.log("Tweet count: " + tweets.statuses.length)

      let inserted = 0
      let existed = 0
      for(tweet_data of tweets.statuses) {
        let tweet = new Tweet(tweet_data, {source: articles[article_index].source, link: articles[article_index].link})
        let result =  await tweet.process()
        inserted += result.inserted
        existed += result.exists
      }

      console.log(inserted + " inserted")
      console.log(existed + " existed")
      if(tweets.statuses.length < 99) {console.log("Removing element..."); articles.shift(); max_id = null; link = null}
      else {max_id = tweets.statuses[tweets.statuses.length-1].id_str-1}
      console.log("--------------------------------------------")

      await delay(5000)
    }
  }
}())
