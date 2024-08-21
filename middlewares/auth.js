// importar modulos
const jwt = require('jwt-simple');
const moment = require('moment');

//importar clave secreta
const libjwt = require('../services/jwt');
const secret = libjwt.secret;

//Middleware de autenticacion
exports.auth = (req, res, next) => {
    //comprobar si me llega la cabecera
    if (!req.headers.authorization) {
        return res.status(403).send({
            status: 'error',
            message: 'La peticion no tiene cabecera de autenticacion'
        });
    }

    //limpiar el token y quitar comillas
    let token = req.headers.authorization.replace(/['"]+/g, '');

    try {
        //decodificar token
        let payload = jwt.decode(token, secret);

        //comprobar si el token ha expirado
        if (payload.exp <= moment().unix()) {
            return res.status(404).send({
                status: 'error',
                message: 'El token ha expirado'
            });
        }

       // agregar datos de usuario
        req.user = payload
        
    } catch (error) {
        return res.status(404).send({
            status: 'error',
            message: 'Token no valido',
            error
        });
    }
     //pasar a la accion
    next();
}
