const db = require("../services/Db")

class List {

  startTimer() {
    setInterval( () => {
      console.log("Getting list");
      this.setDaily()
      this.setHourly()
    }, 120000)
  }

  setWeekly() {
    this.set( (Math.floor(Date.now() / 1000)) - 604800, "weekly" ).then(
      (d) => { this.weekly_data = d }
    )
  }

  setDaily() {
    this.set( (Math.floor(Date.now() / 1000)) - 86400, "daily" ).then(
      (d) => { this.daily_data = d }
    )
  }

  setHourly() {
    this.set( (Math.floor(Date.now() / 1000)) - 3600, "hourly" ).then(
      (d) => { this.hourly_data = d }
    )
  }

  set(start, time_range) {
    let query_string = "SELECT COUNT(*) AS total, COUNT(DISTINCT screen_name) AS users, twitter.link, twitter.source, articles.title, articles.date\
    FROM twitter LEFT JOIN articles ON twitter.link = articles.link\
    WHERE type = 'tweet' AND twitter.timestamp > ? AND twitter.timestamp < ?\
    GROUP BY link, source, title, date ORDER BY total DESC limit 5"
    let inserts = [
      start,
      Math.floor(Date.now() / 1000)
    ]
    let sql = db.mysql.format(query_string, inserts);

    return new Promise((resolve, reject) => {
      db.pool.query(sql, (error, results, fields) => {
        if (error) throw error
        resolve( this.setSpark(results, start, time_range) )
      })
    })

  }

  setSpark(data, start, time_range) {
    let time_format = ''
    if(time_range == "weekly") {time_format = '%Y-%m-%d'}
    else if(time_range == "daily") {time_format = '%Y-%m-%d %H'}
    else if(time_range == "hourly"){ time_format = '%Y-%m-%d %H:%i'}

    for(let item of data) {
      let query_string = "SELECT DATE_FORMAT(date, ?) AS df, count(*) as total FROM twitter WHERE timestamp > ? AND timestamp < ? AND link = ? GROUP BY df"
      let inserts = [
        time_format,
        start,
        Math.floor(Date.now() / 1000),
        item.link
      ]
      let sql = db.mysql.format(query_string, inserts);

      db.pool.query(sql, (error, results, fields) => {
        if (error) throw error
        item.spark = results
      })
    }
    return data
  }

  getWeekly() {
    return this.weekly_data
  }

  getDaily() {
    return this.daily_data
  }

  getHourly() {
    return this.hourly_data
  }

}

let list = new List()
list.setWeekly()
list.setDaily()
list.setHourly()
list.startTimer()
module.exports = list
