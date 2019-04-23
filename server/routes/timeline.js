let express = require('express')
let router = express.Router()

let timeline = require('../controllers/Timeline')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.setHeader('Content-Type', 'application/json')
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  res.json( timeline.getIndex() )
})

module.exports = router;
