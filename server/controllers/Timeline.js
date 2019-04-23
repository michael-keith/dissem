const db = require("../services/Db")

class Timeline {

  constructor() {
    this.i = 0
  }

  startTimer() {
    setInterval( () => { console.log("Getting timeline..."); this.setIndex() }, 600000)
  }

  setIndex() {
    let query_string = "SELECT source, title, DATE_FORMAT(date, '%Y-%m-%d %H:%i') as date FROM articles WHERE timestamp > ? AND timestamp < ? ORDER BY source, date"
    let inserts = [
      (Math.floor(Date.now() / 1000)) - 86400,
      Math.floor(Date.now() / 1000)
    ]
    let sql = db.mysql.format(query_string, inserts);

    db.pool.query(sql, (error, results, fields) => {
      if (error) throw error
      this.timeline_data = this.formatIndex(results)
    })
  }

  formatIndex(results) {
    // Format the results here rather than on the client side as it makes more sense to be providing directly usuable, rather than raw, data through the endpoints.
    let last_source = ""
    let last_date = ""
    let index = -1
    let date_pos = 0;

    let timeline_data = []
    results.forEach( (result, i) => {
      if(result.source != last_source) {
        index++
        last_source = result.source
        date_pos = 0

        timeline_data[index] = {name: result.source}
        timeline_data[index].articles = []
      }
      if(result.date != last_date){last_date = result.date; date_pos = 0}
      else {date_pos++}
      timeline_data[index].articles.push( {source: result.source, title: result.title, date: result.date, date_pos: date_pos } )
    })

    return timeline_data
  }

  getIndex() {
    return this.timeline_data
  }

}

let timeline = new Timeline()
timeline.setIndex()
timeline.startTimer()
module.exports = timeline
