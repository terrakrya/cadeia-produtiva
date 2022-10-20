const fs = require('fs')
const express = require('express')
const router = express.Router()
const multer = require('multer')
const sharp = require('sharp')
const { PDFImage } = require('pdf-image')
const axios = require('axios')
const auth = require('../config/auth')

const createPath = (path) => {
  !fs.existsSync(path) && fs.mkdirSync(path)
}

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
const THUMBS_SIZE = 250
const UPLOAD_PATH = 'api/uploads/'
createPath(UPLOAD_PATH)

const imagesPath = () => {
  let path = UPLOAD_PATH
  path += 'images/'
  createPath(path)
  return path
}

const thumbsPath = () => {
  let path = UPLOAD_PATH
  path += 'thumbs/'
  createPath(path)
  return path
}

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesPath())
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
})
const imageUploader = multer({
  storage: imageStorage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
})

router.post(
  '/images',
  [auth.authenticated, imageUploader.single('file')],
  (req, res) => {
    const filename = req.file.filename

    const original = imagesPath() + filename
    const thumb = thumbsPath() + filename

    sharp(original, { failOnError: false })
      .resize({
        width: THUMBS_SIZE,
        height: THUMBS_SIZE,
        withoutEnlargement: true,
        fit: sharp.fit.inside,
      })
      .toFile(thumb, function (err) {
        if (!err) {
          res.status(201).send({
            url: original,
            thumb,
          })
        } else {
          res.status(201).send({
            url: original,
          })
        }
      })
  }
)

const documentsPath = () => {
  let path = UPLOAD_PATH
  path += 'documents/'
  createPath(path)
  return path
}

const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, documentsPath())
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
})
const documentUploader = multer({
  storage: documentStorage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
})
router.post(
  '/documents',
  [auth.authenticated, documentUploader.single('file')],
  (req, res) => {
    const filename = req.file.filename
    const path = documentsPath()

    if (filename.endsWith('.pdf')) {
      const thumb = thumbsPath() + filename.replace('.pdf', '.png')

      const pdfImage = new PDFImage(req.file.path)

      pdfImage
        .convertPage(0)
        .then(function (original) {
          sharp(original, { failOnError: false })
            .resize({
              width: THUMBS_SIZE,
              height: THUMBS_SIZE,
              withoutEnlargement: true,
              fit: sharp.fit.cover,
            })
            .toFile(thumb, function (err) {
              if (!err) {
                res.status(201).send({
                  title: filename,
                  url: req.file.path,
                  thumb,
                })
              }
            })
        })
        .catch(() => {})
    } else {
      res.status(201).send({ title: filename, url: path + filename })
    }
  }
)

const audiosPath = () => {
  let path = UPLOAD_PATH
  path += 'audios/'
  createPath(path)
  return path
}

const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, audiosPath())
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
})
const audioUploader = multer({
  storage: audioStorage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
})
router.post(
  '/audios',
  [auth.authenticated, audioUploader.single('file')],
  (req, res) => {
    const filename = req.file.filename
    const path = audiosPath()
    res.status(201).send({ title: filename, url: path + filename })
  }
)

router.get('/oembed', async (req, res) => {
  const rawData = await axios
    .get(
      'http://open.iframe.ly/api/oembed?url=' +
        req.query.url +
        '&origin=diegomr86'
    )
    .catch(() => {})
  if (rawData && rawData.data) {
    res.json(rawData.data)
  } else {
    res.status(404).send('Não foi possível carregar o conteúdo do link')
  }
})

module.exports = router
