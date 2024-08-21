const jwt = require('jwt-simple');
const moment = require('moment');

//clave secreta
const secret = 'CLAVE_SECRETA_del-Proyecto_DE_LA_red_social_321'
// Generar token
const createToken = (user) => {
    const payload = {
        id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30, 'days').unix()
    }
    return jwt.encode(payload, secret)

}

module.exports = {
    createToken,
    secret
}