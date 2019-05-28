require('dotenv').config()

const sources = require('../json/sources.json')
let Tweet = require('./tweet')

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

// Create track words string
let track_words = ""
sources.forEach( (source) => track_words = source.track + ", " + track_words )
console.log("TRACKING: " + track_words)

//Start stream
let stream = client.stream('statuses/filter', {track: track_words})

stream.on('data', (data) => {
  if(data.id_str != undefined) {
    tweet = new Tweet(data)
    tweet.process()
  }
  else {console.log(data)}
})

stream.on('error', (error) => {
  throw error
  process.exit()
})

stream.on('end', (res) => {
  console.log(res)
  process.exit()
})

stream.on('destroy', (res) => {
  console.log(res)
  process.exit()
})
