let express = require('express')
let router = express.Router()

let multiline = require('../controllers/Multiline')

router.get('/weekly', function(req, res, next) {
  res.setHeader('Content-Type', 'application/json')
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  res.json( multiline.getWeekly() )
})

router.get('/daily', function(req, res, next) {
  res.setHeader('Content-Type', 'application/json')
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  res.json( multiline.getDaily() )
})

router.get('/hourly', function(req, res, next) {
  res.setHeader('Content-Type', 'application/json')
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  res.json( multiline.getHourly() )
})

module.exports = router;
