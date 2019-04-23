const db = require("../services/Db")

class Barchart {

  startTimer() {
    setInterval( () => {
      this.setWeekly()
      this.setDaily()
      this.setHourly()
    }, 600000)
  }

  setWeekly() {
    this.setBarchart( (Math.floor(Date.now() / 1000)) - 604800 ).then(
      (d) => { this.weekly = d}
    )
  }

  setDaily() {
    this.setBarchart( (Math.floor(Date.now() / 1000)) - 86400 ).then(
      (d) => { this.daily = d}
    )
  }

  setHourly() {
    this.setBarchart( (Math.floor(Date.now() / 1000)) - 3600 ).then(
      (d) => { this.hourly = d}
    )
  }

  setBarchart(start_time) {
    let query_string = "SELECT source, count(source) as total FROM twitter WHERE timestamp > ? AND timestamp < ? GROUP BY source ORDER BY total DESC"
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

let barchart = new Barchart()
barchart.startTimer()
barchart.setWeekly()
barchart.setDaily()
barchart.setHourly()
module.exports = barchart
