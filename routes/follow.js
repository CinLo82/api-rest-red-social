const express = require('express')
const router = express.Router()
const FollowControler = require('../controllers/follow')
const check = require('../middlewares/auth')


// definir ruta
router.get('/prueba-follow', FollowControler.pruebaFollow)
router.post('/save', check.auth, FollowControler.saveFollow)
router.delete('/unfollow/:id', check.auth, FollowControler.unFollow)
router.get('/following/:id?/:page?', check.auth, FollowControler.following)
router.get('/followers/:id?/:page?', check.auth, FollowControler.followers)


//exportar router
module.exports = router