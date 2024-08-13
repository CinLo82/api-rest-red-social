const express = require('express')
const router = express.Router()
const UserControler = require('../controllers/user')

// definir ruta
router.get('/prueba-user', UserControler.pruebaUser)

//exportar router
module.exports = router