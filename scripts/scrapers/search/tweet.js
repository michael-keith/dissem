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

  constructor(data, source) {
    this.data = data
    this.sources = source
  }

  async process() {
    this.setType()
    this.setVars()
    this.setText()

    // console.log(this.id_str)
    // console.log(this.type + ": " + this.text)
    // console.log(this.orig_id_str + ": " + this.orig_screen_name)
    // console.log(this.data.is_quote_status)
    // if(this.type == "quoted") {console.log(this.data)}
    // console.log("--------------------------------")

    let inserted = 0
    let already_exists = 0

    let exists = await this.check_exists(this.id_str)
    if(!exists[0].e) {
      await this.insert(this.sources);
      inserted++
    }
    else {already_exists++}
    return {"inserted": inserted, "exists": already_exists}
  }


  insert(source = {source: null, link: null}, quoted_source = {source: null, link: null}) {
    let sql = "INSERT INTO twitter (source, type, twitter_id, link, screen_name, text, date, timestamp, orig_twitter_id, orig_screen_name, quoted_source, quoted_link, reply_twitter_id, reply_screen_name,catchup) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
    let inserts = [source.source, this.type, this.id_str, source.link, this.screen_name, this.text, this.date, this.timestamp, this.orig_id_str, this.orig_screen_name, quoted_source.source, quoted_source.url, this.reply_id_str, this.reply_screen_name, true]
    sql = mysql.format(sql, inserts)

    return pool.query(sql)
  }

  check_exists(id_str) {
    let sql = "SELECT COUNT(*) AS e FROM twitter WHERE twitter_id = ?"
    let inserts = [id_str]
    sql = mysql.format(sql, inserts)

    return pool.query(sql)
  }

  setType() {
    if(this.data.retweeted_status){this.type = "retweet"}
    else if(this.data.in_reply_to_screen_name) {this.type = "reply"}
    else {this.type = "tweet"}

    if(this.data.is_quote_status){this.quoted = true; this.type = "quoted"}
  }

  setText() {
    this.text = this.data.full_text
    //if(this.data.truncated){ this.text = this.data.extended_tweet.full_text; this.extended = true}

    if(this.type == "retweet") {
      this.text = this.data.retweeted_status.full_text
      //if(this.data.retweeted_status.truncated) {this.text = this.data.retweeted_status.extended_tweet.full_text; this.extended = true}
      //this.text = ""
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
  }

  convert_date(date_string) {
    if(date_string) {
      let ts = new Date(Date.parse(date_string.replace(/( \+)/, ' UTC$1')));
      return ts.getTime() / 1000
    }
  }

}

module.exports = Tweet
