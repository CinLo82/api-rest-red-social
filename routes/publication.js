const express = require('express')
const router = express.Router()
const PublicationControler = require('../controllers/publication')
const check = require('../middlewares/auth')


// definir ruta
router.get('/prueba-Publication', PublicationControler.pruebaPublication)
router.post('/save', check.auth, PublicationControler.savePublication)

//exportar router
module.exports = router