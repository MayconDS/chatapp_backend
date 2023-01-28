var express = require('express')

var router = express.Router()

const multer = require('multer')

const multerConfig = require('../../config/multerImages')

const Picture = require('../models/image')
const { reset } = require('nodemon')

// UPA FOTO DE PERFIL USER
router.post(
  '/upload_pic',

  multer(multerConfig).single('file'),
  async (req, res) => {
    const { name, filename: key, size } = req.file
    try {
      let profilePicture = await Picture.create({
        name,
        size,
        key,
      })
      res.json(profilePicture)
    } catch (error) {
      res.json(error.message).status(500)
    }
  },
)

// ROUTES \\

module.exports = router
