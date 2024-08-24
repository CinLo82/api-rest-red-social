const express = require('express')
const router = express.Router()
const FollowControler = require('../controllers/follow')
const check = require('../middlewares/auth')


// definir ruta
router.get('/prueba-follow', FollowControler.pruebaFollow)
router.post('/save', check.auth, FollowControler.saveFollow)


//exportar router
module.exports = router