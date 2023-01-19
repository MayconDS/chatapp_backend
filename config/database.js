const mongoose = require('mongoose')
mongoose.Promise = global.Promise


  

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
