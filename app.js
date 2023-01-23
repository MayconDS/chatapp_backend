var express = require('express')
var app = express()

var server = app.listen(5000, ()=> {
  console.log('listening on *:3001')
})


var io = require('socket.io').listen(server)


var path = require('path')

var morgan = require('morgan')

require('./config/database')

var cors = require('cors')

var logger = require('morgan')

var usersRouter = require('./app/routes/users')
var chatRouter = require('./app/routes/chat')
const User = require('./app/models/user')

app.use((req, res, next) => {
  req.io = io

  next()
})
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
    allowedHeaders: [
      'Authorization',
      'Content-Type',
      'x-access-token',
      'header',
    ],
  }),
)

app.use('/users', usersRouter)
app.use('/chat', chatRouter)




io.on('connection', async (socket) => {
  let user = await User.findOneAndUpdate(
    { _id: socket.handshake.auth.key },
    { $set: { online: true } },
    { upsert: true, new: true },
  )

  socket.on('disconnect', async () => {
    let user = await User.findOneAndUpdate(
      { _id: socket.handshake.auth.key },
      { $set: { online: false } },
      { upsert: true, new: true },
    )

    console.log('user is disconnected')
  })
})

module.exports = app
