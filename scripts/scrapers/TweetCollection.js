require('dotenv').config();

let Twitter = require('twitter')
let client = new Twitter({
  consumer_key: process.env.TWITTER_CONUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

const Tweet = require('./Tweet');

class TweetCollection {

  constructor(article_data, tweets, source) {
    this.article_data = article_data
    this.tweets = tweets.statuses
  }

  updateTweets() {
    let exists_count = 0
    let i = 0
    return new Promise((resolve, reject) => {
      this.tweets.forEach( tweet_data => {
        let tweet = new Tweet()
        tweet.setArticleData(this.article_data)
        tweet.setTwitterData(tweet_data)
        tweet.manageUpdate().then( exists => {
          exists_count += exists
          i++
          if(i == this.tweets.length) {
            console.log(exists_count + " out of " + this.tweets.length + " exist")
            resolve( {exists_perc: exists_count/this.tweets.length, len: this.tweets.length, max_id: this.tweets[this.tweets.length-1].id_str } )
          }
        })
      })
    })
  }

  getCollection() {

  }

}

module.exports = TweetCollection;
