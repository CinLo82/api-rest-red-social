const express = require('express')
const router = express.Router()
const PublicationControler = require('../controllers/publication')

// definir ruta
router.get('/prueba-Publication', PublicationControler.pruebaPublication)

//exportar router
module.exports = router