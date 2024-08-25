const express = require('express')
const router = express.Router()
const PublicationControler = require('../controllers/publication')
const check = require('../middlewares/auth')


// definir ruta
router.get('/prueba-Publication', PublicationControler.pruebaPublication)
router.post('/save', check.auth, PublicationControler.savePublication)
router.get('/detail/:id', check.auth, PublicationControler.detailPublication)

//exportar router
module.exports = router