const express = require('express')
const multer = require('multer')
const router = express.Router()
const UserControler = require('../controllers/user')
const check = require('../middlewares/auth')


//configurar multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/avatars/')
    },
    filename: (req, file, cb) => {
        cb(null, 'avatar-' + Date.now() + '-' + file.originalname)
    }
})

const uploads = multer({ storage })

// definir ruta
router.get('/prueba-user', check.auth, UserControler.pruebaUser)
router.post('/register', UserControler.register)
router.post('/login', UserControler.login)
router.get('/profile/:id', check.auth, UserControler.profile)
router.get('/list/:page?', check.auth, UserControler.list)
router.put('/update', check.auth, UserControler.update)
router.post('/upload', [check.auth, uploads.single('file0')], UserControler.upload)
router.get('/avatar/:file', UserControler.avatar)
router.get('/counters/:id', check.auth, UserControler.counters)


//exportar router
module.exports = router