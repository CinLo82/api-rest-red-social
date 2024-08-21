const express = require('express')
const router = express.Router()
const UserControler = require('../controllers/user')
const check = require('../middlewares/auth')

// definir ruta
router.get('/prueba-user', check.auth, UserControler.pruebaUser)
router.post('/register', UserControler.register)
router.post('/login', UserControler.login)
router.get('/profile/:id', check.auth, UserControler.profile)

//exportar router
module.exports = router