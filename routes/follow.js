const express = require('express')
const router = express.Router()
const FollowControler = require('../controllers/follow')

// definir ruta
router.get('/prueba-follow', FollowControler.pruebaFollow)

//exportar router
module.exports = router