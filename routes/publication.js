const express = require('express')
const router = express.Router()
const PublicationControler = require('../controllers/publication')
const check = require('../middlewares/auth')
const multer = require('multer')

//configurar multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/publications/')
    },
    filename: (req, file, cb) => {
        cb(null, 'pub-' + Date.now() + '-' + file.originalname)
    }
})

const uploads = multer({ storage })


// definir ruta
router.get('/prueba-Publication', PublicationControler.pruebaPublication)
router.post('/save', check.auth, PublicationControler.savePublication)
router.get('/detail/:id', check.auth, PublicationControler.detailPublication)
router.delete('/delete/:id', check.auth, PublicationControler.deletePublication)
router.get('/user/:id/:page?', check.auth, PublicationControler.userPublications)
router.post('/upload/:id', [check.auth, uploads.single('file0')], PublicationControler.uploadImage)

//exportar router
module.exports = router