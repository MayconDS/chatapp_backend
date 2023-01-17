const multer = require('multer')
const path = require('path')
const crypto = require('crypto')

module.exports = {
  dest: path.resolve(__dirname, '..', 'public', 'videos'),
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.resolve(__dirname, '..', 'public', 'videos'))
    },
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, hash) => {
        if (err) cb(err)

        const fileName = `${hash.toString('hex')}-${file.originalname}`

        cb(null, fileName)
      })
    },
  }),

  fileFilter: (req, file, cb) => {
    const allowedMimes = ['video/mp4', 'video/mkv']
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type'))
    }
  },
}
