const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

let userSchema = new mongoose.Schema({
  online: { type: Boolean, default: false },
  bio: { type: String, default: 'Novato' },
  user: { type: String, unique: true },
  name: String,
  chats: { type: Array },
  picture: {
    type: String,
    default: 'https://chatapp-backend-0c25.onrender.com/images/avatar.webp',
  },
  email: { type: String, required: true, unique: true },
  password: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
})

userSchema.index({ user: 'text', name: 'text' })

userSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('password')) {
    bcrypt.hash(this.password, 10, (err, hashedPassword) => {
      if (err) next(err)
      else {
        this.password = hashedPassword
        next()
      }
    })
  }
})

userSchema.methods.isCorrectPassword = function (password, callback) {
  bcrypt.compare(password, this.password, function (err, same) {
    if (err) {
      callback(err)
    } else {
      callback(err, same)
    }
  })
}

module.exports = mongoose.model('User', userSchema)
