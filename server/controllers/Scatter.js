const db = require("../services/Db")

class Scatter {

  startTimer() {
    setInterval( () => {
      this.setWeekly()
      this.setDaily()
      this.setHourly()
    }, 120000)
  }

  setWeekly() {
    this.set( (Math.floor(Date.now() / 1000)) - 604800 ).then(
      (d) => { this.weekly = d}
    )
  }

  setDaily() {
    this.set( (Math.floor(Date.now() / 1000)) - 86400 ).then(
      (d) => { this.daily = d}
    )
  }

  setHourly() {
    this.set( (Math.floor(Date.now() / 1000)) - 3600 ).then(
      (d) => { this.hourly = d}
    )
  }

  set(start_time) {
    let query_string = "SELECT twitter.source, DATE_FORMAT(articles.date, '%Y-%m-%d %H:%i') AS df, articles.title, twitter.link, COUNT(*) AS total FROM twitter LEFT JOIN articles ON twitter.link = articles.link WHERE type = 'tweet' AND articles.timestamp > ? AND articles.timestamp < ? GROUP BY link, title, source, df ORDER BY total DESC LIMIT 100"
    let inserts = [
      start_time,
      Math.floor(Date.now() / 1000)
    ]
    let sql = db.mysql.format(query_string, inserts)

    return new Promise((resolve, reject) => {
      db.pool.query(sql, (error, results, fields) => {
        if (error) throw error
        resolve( results )
      })
    })
  }

  getWeekly() {
    return this.weekly
  }

  getDaily() {
    return this.daily
  }

  getHourly() {
    return this.hourly
  }

}

let scatter = new Scatter()
scatter.startTimer()
scatter.setWeekly()
scatter.setDaily()
scatter.setHourly()
module.exports = scatter
