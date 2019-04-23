let express = require('express')
let router = express.Router()

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send( "INDEX" )
})

router.get('/test', function(req, res, next) {
  res.send( "Test" )
})

module.exports = router;
