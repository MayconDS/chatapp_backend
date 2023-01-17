const mongoose = require('mongoose')

let chatSchema = new mongoose.Schema({
  messages: { type: Array },
  users: { type: Array },
  status: { type: String },
  last_seen: { type: Date },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Chat', chatSchema)
