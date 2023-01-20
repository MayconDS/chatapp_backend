const mongoose = require('mongoose')
require('dotenv').config('')
mongoose.Promise = global.Promise

mongoose.set('strictQuery', true)

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch((err) => console.log(err.message))

// mongodb://localhost/chatappDatabase
