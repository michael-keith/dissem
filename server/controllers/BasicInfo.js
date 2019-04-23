const db = require("../services/Db")

class BasicInfo {

  startTimer() {
    setInterval( () => {
      this.setSparkline()
      this.setTotal()
    }, 600000)
  }

  setSparkline() {
    this.setSparklineData( (Math.floor(Date.now() / 1000)) - 86400 ).then(
      (d) => { this.sparkline = d }
    )
  }

  setBarchart() {
    this.setBarchartData( (Math.floor(Date.now() / 1000)) - 86400 ).then(
      (d) => { this.barchart = d}
    )
  }

  setTotal() {
    this.setTotalData( (Math.floor(Date.now() / 1000)) - 86400 ).then(
      (d) => { this.total = d}
    )
  }

  setTotalData(start_time) {
    let query_string = "SELECT COUNT(*) as total, COUNT(DISTINCT screen_name) as users FROM twitter WHERE timestamp > ? AND timestamp < ?"
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

  setSparklineData(start_time) {
    let query_string = "SELECT DATE_FORMAT(date, '%Y-%m-%d %H') AS df, count(*) as total FROM twitter WHERE timestamp > ? AND timestamp < ? GROUP BY df"
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

  getSparklineDaily() {
    return this.sparkline
  }


  getTotal() {
    return this.total
  }

}

let basic_info = new BasicInfo()
basic_info.startTimer()
basic_info.setSparkline()
basic_info.setTotal()
module.exports = basic_info
