var express = require('express')

var router = express.Router()

const jwt = require('jsonwebtoken')

var bcrypt = require('bcrypt')

var nodemailer = require('nodemailer')

const WithAuth = require('../middlewares/auth')

const multer = require('multer')

const multerConfig = require('../../config/multerImages')

const Picture = require('../models/image')
const { reset } = require('nodemon')
const Chat = require('../models/chat')
const User = require('../models/user')

var app = express()

var http = require('http').Server(app)
var io = require('socket.io')(http)

const moment = require('moment')

require('dotenv').config()
const secret = process.env.JWT_TOKEN

// ROUTES

// ENVIA MENSAGEM
router.post('/send', WithAuth, async (req, res) => {
  const { chatId, userId, type, body, users } = req.body
  let chat = await Chat.findById(chatId)
  let authorMessage = await User.findById(userId)

  try {
    chat.messages.push({
      type: type,
      author: authorMessage,
      body: body,
      date: new Date(),
    })

    chat.save()
    for (let i in users) {
      let u = await User.find({ user: users[i] })

      if (u[0].chats) {
        let chats = [...u[0].chats]

        for (let chat in chats) {
          if (chats[chat].chatId == chatId) {
            if (u[0]._id != userId) {
              chats[chat].lastMessage = body
              chats[chat].lastMessageDate = new Date()

              chats[chat].status = 'Online'
            } else {
              chats[chat].lastMessage = body
              chats[chat].lastMessageDate = new Date()
              chats[chat].last_seen = new Date()
            }
          }
        }

        await User.findOneAndUpdate(
          { user: users[i] },
          { $set: { chats: chats } },
          { upsert: true, new: true },
        )
      }
    }

    res.status(200).json({ sucess: 'Sucess' })

    req.io.emit('new-message', chat.messages)

    req.io.emit('new-lastmessage', 'update')
  } catch (error) {
    res.status(200).json({ error: error.message + 'e' })
  }
})

router.post('/newchat', WithAuth, async (req, res) => {
  const { user, targetUser } = req.body
  let hasChat = false
  let newChatCondition = await Chat.find()
  newChatCondition.map((item) => {
    if (item.users) {
      for (let i = 0; i < item.users.length; i++) {
        if (item.users[i] == user) {
          hasChat = true
        }
      }
    }
  })

  if (hasChat == true) {
    res.status(200).json({ message: 'Chat already created' })
  } else {
    let newChat = new Chat({
      messages: [],
      users: [user, targetUser],
    })
    let user1 = await User.find({ user: user })
    let user2 = await User.find({ user: targetUser })

    try {
      newChat.save()

      let chatUser1 = []
      let chatUser2 = []

      user1.map((item) => {
        chatUser1.push(...item.chats)
      })
      user2.map((item) => {
        chatUser2.push(...item.chats)
      })

      chatUser1.push({
        chatId: newChat._id,
        me: user1,
        with: user2,
      })
      chatUser2.push({
        chatId: newChat._id,
        me: user2,
        with: user1,
      })

      let newUser1 = await User.findOneAndUpdate(
        { user: user },
        { $set: { chats: chatUser1 } },
        { upsert: true, new: true },
      )
      let newUser2 = await User.findOneAndUpdate(
        { user: targetUser },
        { $set: { chats: chatUser2 } },
        { upsert: true, new: true },
      )

      res.status(200).json({ message: 'Chat created with Sucess' })
      req.io.emit('new-chat', chatUser1)
    } catch (error) {
      res.status(200).json({ error: error.message })
    }
  }
})
router.get('/chatlist', WithAuth, async (req, res) => {
  try {
    let user = await User.findById(req.user._id)
    let chats = user.chats

    chats.sort((a, b) => {
      let dateA = Math.round(new Date(a.lastMessageDate) / 1000)
      let dateB = Math.round(new Date(b.lastMessageDate) / 1000)

      if (dateA == undefined) {
        return -1
      }
      if (dateA < dateB) {
        return 1
      } else {
        return -1
      }
    })

    res.status(200).json({ chats: chats })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
router.get('/content/:chatId', WithAuth, async (req, res) => {
  const { chatId } = req.params
  try {
    let chatContent = await Chat.findById(chatId)
    res.status(200).json(chatContent)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
router.get('/allchats', WithAuth, async (req, res) => {
  try {
    let chats = await Chat.find()
    res.status(200).json({ chats })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.delete('/del', WithAuth, async (req, res) => {
  try {
    let chat = await Chat.deleteMany()
    let user = await User.find()

    user.map(async (item) => {
      let deleteChatsUser = await User.findOneAndUpdate(
        { _id: item._id },
        { $set: { chats: [] } },
        { upsert: true, new: true },
      )
    })
    res.json({ message: 'Sucess' })
  } catch (error) {
    res.status(401).json({ error: error.message })
  }
})
// ROUTES \\

module.exports = router
