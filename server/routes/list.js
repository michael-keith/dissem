let express = require('express')
let router = express.Router()

let list = require('../controllers/List')

router.get('/weekly', function(req, res, next) {
  res.setHeader('Content-Type', 'application/json')
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  res.json( list.getWeekly() )
})

router.get('/daily', function(req, res, next) {
  res.setHeader('Content-Type', 'application/json')
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  res.json( list.getDaily() )
})

router.get('/hourly', function(req, res, next) {
  res.setHeader('Content-Type', 'application/json')
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  res.json( list.getHourly() )
})

module.exports = router;
