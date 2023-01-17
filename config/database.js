const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const uri =
  'mongodb+srv://mike:nosloko12@chatapp.qyjjmil.mongodb.net/?retryWrites=true&w=majority'

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch((err) => console.log(err.message))

// mongodb://localhost/chatappDatabase
