let express = require('express')
let path = require('path')
let cookieParser = require('cookie-parser')
let logger = require('morgan')

let indexRouter = require('./routes/index')
let timelineRouter = require('./routes/timeline')
let multilineRouter = require('./routes/multiline')
let listRouter = require('./routes/list')
let scatterRouter = require('./routes/scatter')
let barchartRouter = require('./routes/barchart')
let basicInfoRouter = require('./routes/basic_info')

let app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/timeline/', timelineRouter)
app.use('/multiline/', multilineRouter)
app.use('/list/', listRouter)
app.use('/scatter/', scatterRouter)
app.use('/barchart/', barchartRouter)
app.use('/basic_info/', basicInfoRouter)

module.exports = app
