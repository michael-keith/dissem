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

//Stall checker
let i = 0
setInterval( () => {
  console.log(i + " tweets per minute @ (" + new Date() + ")")
  if(i == 0) {process.exit()}
  i = 0
}, 60000)

//Start stream
let stream = client.stream('statuses/filter', {track: track_words})

stream.on('data', (data) => {
  if(data.id_str != undefined) {
    tweet = new Tweet(data)
    tweet.process()
    i++
  }
  else {console.log(data)}
})

stream.on('error', (error) => {
  console.log("DEBUG - ERROR: " + new Date())
  throw error
  process.exit()
})

stream.on('end', (res) => {
  console.log("DEBUG - ENDED: " + new Date())
  console.log(res)
  process.exit()
})

stream.on('destroy', (res) => {
  console.log("DEBUG - Destroy: " + new Date())
  console.log(res)
  process.exit()
})
