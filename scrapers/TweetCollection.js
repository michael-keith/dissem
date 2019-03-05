require('dotenv').config();

let Twitter = require('twitter');
let client = new Twitter({
  consumer_key: process.env.TWITTER_CONUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

class TweetCollection {

  constructor(article_data) {
    this.article_data = article_data;
  }

  manageCollection() {
    return new Promise((resolve, reject) => {
      this.getCollection().then( tweets => {
        tweets.statuses.forEach( tweet_data => {
          console.log(tweet_data.text);
        });
        resolve();
      });
    });
  }

  getCollection() {
    return new Promise((resolve, reject) => {
      console.log(this.article_data.link);
      let query = this.article_data.link;
      client.get('search/tweets', {q: query, result_type: "recent", count: "100", exclude:"retweets" } ,(error, tweets, response) => {
        if(error) {console.log(response); throw error;}
        resolve(tweets);
      });
    });
  }

}

module.exports = TweetCollection;
