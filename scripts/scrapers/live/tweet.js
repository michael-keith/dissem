require('dotenv').config()

const util = require('util')
const mysql = require('mysql')
const pool  = mysql.createPool({
  connectionLimit : 100,
  host            : process.env.DB_HOST,
  user            : process.env.DB_USER,
  password        : process.env.DB_PASS,
  database        : process.env.DB_DATABASE,
  charset : 'utf8mb4'
})
pool.query = util.promisify(pool.query)

const sources = require('../json/sources.json')

class Tweet {

  constructor(data) {
    this.data = data
  }

  process() {
    this.setType()
    this.setVars()
    this.setText()

    this.setUrlKey()
    this.sources = this.setSources(this.urls_key)
    if(this.quoted) {this.quoted_sources = this.setSources(this.quoted_urls_key)}
    else {this.quoted_sources = []}

    this.sources.forEach( async(source) => {
       await this.insert(source)
    })

    this.quoted_sources.forEach( async(source) => {
      if(this.text != "") {this.type = "quoted"}
      if(this.text == "" && this.type == "retweet") {this.type = "quotret"}
      if(this.type != "quotret") {await this.insert(source, source)}
    })

    // console.log(this.id_str)
    // console.log(this.type + ": " + this.text)
    // console.log(this.sources)
    // console.log(this.quoted_sources)
    // console.log("--------------------------------")

  }


  insert(source = {source: null, link: null}, quoted_source = {source: null, link: null}) {
    let sql = "INSERT IGNORE INTO twitter (source, type, twitter_id, link, screen_name, text, date, timestamp, orig_twitter_id, orig_screen_name, quoted_source, quoted_link, reply_twitter_id, reply_screen_name) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
    let inserts = [source.source, this.type, this.id_str, source.link, this.screen_name, this.text, this.date, this.timestamp, this.orig_id_str, this.orig_screen_name, quoted_source.source, quoted_source.link, this.reply_id_str, this.reply_screen_name]
    sql = mysql.format(sql, inserts)

    return pool.query(sql)
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

    if(this.type == "retweet") {
      this.text = this.data.retweeted_status.text
      if(this.data.retweeted_status.truncated) {this.text = this.data.retweeted_status.extended_tweet.full_text; this.extended = true}
      this.text = ""
    }
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

    //Reply
    this.data.in_reply_to_status_id_str != undefined ? this.reply_id_str = this.data.in_reply_to_status_id_str : this.data.in_reply_to_status_id_str = null
    this.data.in_reply_to_screen_name != undefined ? this.reply_screen_name = this.data.in_reply_to_screen_name : this.data.in_reply_to_screen_name = null

    //Retweet
    this.data.retweeted_status != undefined ? this.orig_id_str = this.data.retweeted_status.id_str : this.orig_id_str = null
    this.data.retweeted_status != undefined ? this.orig_screen_name = this.data.retweeted_status.user.screen_name : this.orig_screen_name = null

    //Quoted
    if(this.quoted) {
      this.data.quoted_status != undefined ? this.orig_id_str = this.data.quoted_status.id_str : this.orig_id_str = null
      this.data.quoted_status != undefined ? this.orig_screen_name = this.data.quoted_status.user.screen_name : this.orig_screen_name = null
    }
  }

  setUrlKey() {
    if(this.type == "tweet" || this.type == "reply") {
      this.urls_key = this.data.entities.urls
      if(this.extended) {this.urls_key = this.data.extended_tweet.entities.urls}
    }

    if(this.type == "retweet") {
      this.urls_key = this.data.retweeted_status.entities.urls
      if(this.extended){this.urls_key = this.data.retweeted_status.extended_tweet.entities.urls}
    }

    if(this.quoted) {
      this.quoted_urls_key = this.data.quoted_status.entities.urls
      if(this.data.quoted_status.truncated) {this.quoted_urls_key = this.data.quoted_status.extended_tweet.entities.urls}
    }
  }

  setSources(key) {
    let s = []
    key.forEach( (url) => {
      sources.forEach( (source) => {
        if( (url.expanded_url.includes("." + source.url) || url.expanded_url.includes("://" + source.url)) && url.expanded_url != "https://www." + source.url && url.expanded_url != "http://www." + source.url && url.expanded_url != "https://" + source.url && url.expanded_url != "jobs." + source.url){
          //Remove extra url params
          url.expanded_url = url.expanded_url.replace("http://", "https://")
          let n = url.expanded_url.indexOf('?')
          url.expanded_url = url.expanded_url = url.expanded_url.substring(0, n != -1 ? n : url.expanded_url.length)
          url.expanded_url = url.expanded_url.replace(/https\:\/\/www\.google\..+\/amp\/s\/amp\./, "https://www.")
          url.expanded_url = url.expanded_url.replace(/https\:\/\/www\.google\..+\/amp\/s\/www./, "https://www.")
          url.expanded_url = url.expanded_url.replace("https://amp.", "https://www.")
          url.expanded_url = url.expanded_url.replace("https://web.archive.org/web/20150912124604/", "https://www.")
          url.expanded_url = url.expanded_url.replace("/amp/", "/")
          url.expanded_url = url.expanded_url.replace("#", "")
          //Conversion
          if(source.conversion) {url.expanded_url = url.expanded_url.replace(new RegExp(source.conversion.pattern, 'i'), source.conversion.output)}
          s.push({"source": source.name, "link": url.expanded_url})
        }
      })
    })
    return s
  }

  convert_date(date_string) {
    if(date_string) {
      let ts = new Date(Date.parse(date_string.replace(/( \+)/, ' UTC$1')));
      return ts.getTime() / 1000
    }
  }

}

module.exports = Tweet
