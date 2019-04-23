let express = require('express')
let router = express.Router()

let basic_info = require('../controllers/BasicInfo')

router.get('/sparkline/daily', function(req, res, next) {
  res.setHeader('Content-Type', 'application/json')
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  res.json( basic_info.getSparklineDaily() )
})

router.get('/total', function(req, res, next) {
  res.setHeader('Content-Type', 'application/json')
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  res.json( basic_info.getTotal() )
})

module.exports = router;
