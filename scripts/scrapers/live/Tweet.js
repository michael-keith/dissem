require('dotenv').config()

const mysql = require('mysql')
const pool  = mysql.createPool({
  connectionLimit : 100,
  host            : process.env.DB_HOST,
  user            : process.env.DB_USER,
  password        : process.env.DB_PASS,
  database        : process.env.DB_DATABASE,
  charset : 'utf8mb4'
})

const sources = require('../json/sources.json')

class Tweet {

  constructor(data = false) {
    this.data = data
  }

  async process() {
    this.setType()
    this.setText()
    this.setVars()

    if(this.type!="retweet") {
      this.setUrlKeys()
      this.sources = this.setSources(this.urls_key)
      if(this.quoted) {this.quoted_sources = this.setSources(this.quoted_urls_key)}
      else {this.quoted_sources = []}

      this.sources.forEach( (source) => {this.insert(source)})
      //this.quoted_sources.forEach( (source) => {this.insert(source, true)})

      console.log("-----------------------------")
      console.log(this.type)
      console.log(this.text)
      console.log(this.id_str)
      this.sources.forEach( (source) => {console.log("SOURCE: " + source.source)})
      this.quoted_sources.forEach( (source) => {console.log("QUOTED: " + source.source)})
    }
  }

  setType() {
    if(this.data.retweeted_status){this.type = "retweet"}
    else if(this.data.in_reply_to_screen_name) {this.type = "reply"}
    else {this.type = "tweet"}

    if(this.data.quoted_status){this.quoted = true}
  }

  setText() {
    this.text = this.data.text
    if(this.data.truncated){ this.text = this.data.extended_tweet.full_text; this.extended = true}
    else if(this.type == "retweet" && this.data.retweeted_status.truncated){this.text = this.data.retweeted_status.extended_tweet.full_text; this.extended = true}
  }

  setVars() {
    this.id_str = this.data.id_str
    this.source = this.data.source
    this.date = new Date(this.data.created_at)
    this.timestamp = this.convert_date(this.data.created_at)
    this.user_id = this.data.user.id_str
    this.name = this.data.user.name
    this.screen_name = this.data.user.screen_name
    this.location = this.data.user.location
    this.verified = this.data.user.verified
    this.followers = this.data.user.followers_count
    this.following = this.data.user.friends_count
    this.statuses = this.data.user.statuses
    this.lang = this.data.user.lang
    this.picture = this.data.user.profile_image_url_https
    this.default_profile = this.data.user.default_profile
    this.default_profile_image = this.data.user.default_profile_image
  }

  setUrlKeys() {
    this.urls_key = this.data.entities.urls
    if(this.extended) {this.urls_key = this.data.extended_tweet.entities.urls}

    if(this.quoted) {
      this.quoted_urls_key = this.data.quoted_status.entities.urls
      if(this.data.quoted_status.truncated) {this.quoted_urls_key = this.data.quoted_status.extended_tweet.entities.urls}
    }
  }

  setSources(key) {
    let s = []
    key.forEach( (url) => {
      sources.forEach( (source) => {
        if(url.expanded_url.includes(source.url) && url.expanded_url != "https://www." + source.url){
          if(source.conversion){
            console.log("CONVERSION: " + url.expanded_url)
            url.expanded_url = url.expanded_url.replace(source.url, source.conversion)
            console.log("CONVERTED TO: " + url.expanded_url)
          }
          //Remove extra url params
          let n = url.expanded_url.indexOf('?')
          url.expanded_url = url.expanded_url.substring(0, n != -1 ? n : url.expanded_url.length)
          s.push({"source": source.name, "url": url.expanded_url})
        }
      })
    })
    return s
  }

  insert(source, quoted=false) {
    let sql = "INSERT INTO twitter (source, twitter_id, link, screen_name, text, date, timestamp) VALUES(?,?,?,?,?,?,?)"

    if(quoted) {sql = "INSERT INTO twitter (quoted_source, twitter_id, quoted_link, screen_name, text, date, timestamp) VALUES(?,?,?,?,?,?,?)"}

    let inserts = [source.source, this.id_str, source.url, this.screen_name, this.text, this.date, this.timestamp]
    sql = mysql.format(sql, inserts)

    return new Promise((resolve, reject) => {
      pool.getConnection( (err, connection) =>  {
        connection.query( sql, (err, rows) => {
          if (err) {throw err}
          connection.release()
          resolve()
        })
      })
    })

  }

  convert_date(date_string) {
    if(date_string) {
      let ts = new Date(Date.parse(date_string.replace(/( \+)/, ' UTC$1')));
      return ts.getTime() / 1000
    }
  }

}

module.exports = Tweet
