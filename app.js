var express = require('express')
var app = express()

var path = require('path')

var morgan = require('morgan')

require('./config/database')

var cors = require('cors')

var logger = require('morgan')

var imagesRouter = require('./app/routes/image')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(express.static(path.join(__dirname, 'public')))
app.use(
  cors({
    origin: '*',
    credentials: true,
    methods: ['POST', 'GET', 'PUT', 'DELTE', 'OPTIONS'],
    exposedHeaders: ['Authorization'],
    allowedHeaders: ['Authorization', 'Content-Type', 'x-access-token'],
  }),
)

app.use('/images', imagesRouter)

app.listen(4001, () => {
  console.log('listening')
})

module.exports = app
