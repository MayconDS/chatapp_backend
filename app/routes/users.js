var express = require('express')

var router = express.Router()

const User = require('../models/user')

const jwt = require('jsonwebtoken')

var bcrypt = require('bcrypt')

const WithAuth = require('../middlewares/auth')

const multer = require('multer')

const multerConfig = require('../../config/multerImages')

const Picture = require('../models/image')
const { reset } = require('nodemon')
const Chat = require('../models/chat')

require('dotenv').config()
const secret = process.env.JWT_TOKEN

// ROUTES

// REGISTRA USER
router.post('/register', async (req, res) => {
  const { name, email, password, user } = req.body
  const newUser = new User({ user, name, email, password })

  try {
    await newUser.save()
    res.status(200).json(newUser)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// LOGA USER
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  try {
    let user = await User.findOne({ email })
    if (!user) {
      res.status(401).json({ error: 'Incorrect email or password' })
    } else {
      user.isCorrectPassword(password, function (err, same) {
        if (!same) {
          res.status(401).json({ error: 'Incorrect email or password' })
        } else {
          const token = jwt.sign({ email }, secret, {
            expiresIn: '30d',
          })
          res.json({ user: user, token: token })
        }
      })
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal error, please try again' })
  }
})

// RETORNA USER LOGADO
router.get('/', WithAuth, async (req, res) => {
  try {
    const user = await User.find({ _id: req.user._id }, { password: 0 })
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: 'Problem to get user' })
  }
})

// RETORNA TODOS USERS, MENOS VOCÊ
router.get('/all', WithAuth, async (req, res) => {
  try {
    let contacts = []
    let users = await User.find()
    users.forEach((user) => {
      if (user.user !== req.user.user) {
        contacts.push(user)
      }
    })
    res.json(contacts).status(200)
  } catch (err) {
    res.status(500).json({ error: 'Problem to get all users' })
  }
})
// RETORNA TODOS USERS DO BANCO DE DADOS
router.get('/alldb', WithAuth, async (req, res) => {
  try {
    let users = await User.find()

    res.json(users).status(200)
  } catch (err) {
    res.status(500).json({ error: 'Problem to get all users' })
  }
})

// RETORNA USER POR QUERY

router.get('/search', WithAuth, async (req, res) => {
  const { query } = req.query
  try {
    let users = await User.find({ $text: { $search: query } })
    res.status(200).json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ATUALIZA EMAIL USER
// router.put('/email', WithAuth, async (req, res) => {
//   const { email } = req.body

//   try {
//     const user = await User.findOneAndUpdate(
//       {
//         _id: req.user._id,
//       },
//       { $set: { email: email } },
//       { upsert: true, new: true },
//     )
//     await updateAllChatsOfUser(req.user._id)
//     res.json(user)
//     req.io.emit('user_updated', {
//       condition: 'reload_user',
//       local: 'upload-email',
//     })
//   } catch (error) {
//     res.status(401).json({ error: error.message })
//   }
// })

// ATUALIZA PASSWORD USER
// router.put('/password', WithAuth, async (req, res) => {
//   const { password, newPassword } = req.body

//   try {
//     const user = await User.findOne({ _id: req.user._id })
//     user.isCorrectPassword(password, function (err, same) {
//       if (!same) {
//         return res.status(401).json({ error: 'Password not correspond' })
//       } else {
//         user.password = newPassword
//         user.save()
//       }

//       res.json(user)
//       req.io.emit('user_updated', {
//         condition: 'reload_user',
//         local: 'upload-password',
//       })
//     })
//     await updateAllChatsOfUser(req.user._id)
//   } catch (error) {
//     res.status(401).json({ error: error.message })
//   }
// })

// ATUALIZA NAME USER
router.put('/name', WithAuth, async (req, res) => {
  const { name } = req.body

  try {
    const user = await User.findOneAndUpdate(
      {
        _id: req.user._id,
      },
      { $set: { name: name } },
      { upsert: true, new: true },
    )
    await updateAllChatsOfUser(req.user._id)
    res.json(user)
    req.io.emit('user_updated', {
      condition: 'reload_user',
      local: 'upload-name',
    })
  } catch (error) {
    res.status(401).json({ error: error.message })
  }
})

// ATUALIZA USUARIO DO  USER
// router.put('/user', WithAuth, async (req, res) => {
//   const { user } = req.body

//   try {
//     const updateUser = await User.findOneAndUpdate(
//       {
//         _id: req.user._id,
//       },
//       { $set: { user: user } },
//       { upsert: true, new: true },
//     )
//     await updateAllChatsOfUser(req.user._id)
//     res.json(updateUser)
//     req.io.emit('user_updated', {
//       condition: 'reload_user',
//       local: 'upload-user',
//     })
//   } catch (error) {
//     res.status(401).json({ error: error.message })
//   }
// })

// ATUALIZA BIO USER
router.put('/bio', WithAuth, async (req, res) => {
  const { bio } = req.body

  try {
    const user = await User.findOneAndUpdate(
      {
        _id: req.user._id,
      },
      { $set: { bio: bio } },
      { upsert: true, new: true },
    )
    await updateAllChatsOfUser(req.user._id)
    res.json(user)
    req.io.emit('user_updated', {
      condition: 'reload_user',
      local: 'upload-bio',
    })
  } catch (error) {
    res.status(401).json({ error: error.message })
  }
})
// DELETA USER
router.delete('/delete', WithAuth, async (req, res) => {
  try {
    let user = await User.findOneAndDelete({ _id: req.user._id })
    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    res.status(401).json({ error: error.message })
  }
})

// DELETA TODOS USER
// router.delete('/del', WithAuth, async (req, res) => {
//   try {
//     let user = await User.deleteMany()
//     res.json({ message: 'User deleted successfully' })
//   } catch (error) {
//     res.status(401).json({ error: error.message })
//   }
// })

// UPA FOTO DE PERFIL USER
router.post(
  '/upload_pic',
  WithAuth,
  multer(multerConfig).single('file'),
  async (req, res) => {
    const { name, filename: key, size } = req.file
    try {
      let profilePicture = await Picture.create({
        name,
        size,
        key,
      })

      let user = await User.findOneAndUpdate(
        req.user._id,
        {
          $set: {
            picture: `http://localhost:3001/images/${profilePicture.key}`,
          },
        },
        { upsert: true, new: true },
      )
      await updateAllChatsOfUser(req.user._id)
      res.status(200).json(user)
      req.io.emit('user_updated', {
        condition: 'reload_user',
        local: 'upload-image',
      })
    } catch (error) {
      res.json(error.message).status(500)
    }
  },
)

const updateAllChatsOfUser = async (userId) => {
  let user = await User.findById(userId)

  try {
    for (let i = 0; i < user.chats.length; i++) {
      // UPDATE IN DB USERS
      let chats = []
      let targetUser = await User.findById(user.chats[i].with[0]._id)
      for (let c = 0; c < targetUser.chats.length; c++) {
        if (
          JSON.stringify(targetUser.chats[c].with[0]._id) ==
          JSON.stringify(user._id)
        ) {
          targetUser.chats[c].with[0] = user
          chats.push(targetUser.chats[c])
        }
      }
      let newTargetUser = await User.findByIdAndUpdate(
        { _id: targetUser.id },
        { $set: { chats: chats } },
        { upsert: true, new: true },
      )
      // UPDATE IN DB CHATS
      let messages = []
      let chat = await Chat.findById(user.chats[i].chatId)
      for (let c = 0; c < chat.messages.length; c++) {
        if (
          JSON.stringify(chat.messages[c].author._id) ==
          JSON.stringify(user._id)
        ) {
          chat.messages[c].author = user
        }

        messages.push(chat.messages[c])
      }

      let newChat = await Chat.findOneAndUpdate(
        { _id: chat._id },
        { $set: { messages: messages } },
        { upsert: true, new: true },
      )
    }

    return 'sucess'
  } catch (error) {
    return error.message
  }
}

// ROUTES \\

module.exports = router
