const db = require("../services/Db")

class Multiline {

  startTimer() {
    setInterval( () => {
      this.setWeekly()
      this.setDaily()
      this.setHourly()
    }, 600000)
  }

  setWeekly() {
    this.set( (Math.floor(Date.now() / 1000)) - 604800, '%Y-%m-%d').then(
      (d) => { this.weekly = d}
    )
  }

  setDaily() {
    this.set( (Math.floor(Date.now() / 1000)) - 86400, '%Y-%m-%d %H').then(
      (d) => { this.daily = d}
    )
  }

  setHourly() {
    this.set( (Math.floor(Date.now() / 1000)) - 3600, '%Y-%m-%d %H:%i').then(
      (d) => { this.hourly = d}
    )
  }

  set(start_time, time_format) {
    let query_string = "SELECT source, DATE_FORMAT(date, ?) AS df, count(source) as total FROM twitter WHERE timestamp > ? AND timestamp < ? GROUP BY source, df"
    let inserts = [
      time_format,
      start_time,
      Math.floor(Date.now() / 1000)
    ]
    let sql = db.mysql.format(query_string, inserts)

    return new Promise((resolve, reject) => {
      db.pool.query(sql, (error, results, fields) => {
        if (error) throw error
        resolve( this.format(results) )
      })
    })
  }

  format(data) {
    return data.reduce( (mem, x) => {
      if (!mem[x['source']]) { mem[x['source']] = [] }
      mem[x['source']].push(x)
      return mem
    }, {})
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

let multiline = new Multiline()
multiline.startTimer()
multiline.setWeekly()
multiline.setDaily()
multiline.setHourly()
module.exports = multiline
