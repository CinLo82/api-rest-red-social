const express = require('express')
const router = express.Router()
const UserControler = require('../controllers/user')

// definir ruta
router.get('/prueba-user', UserControler.pruebaUser)
router.post('/register', UserControler.register)
router.post('/login', UserControler.login)

//exportar router
module.exports = router