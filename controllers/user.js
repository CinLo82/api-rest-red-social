const  User = require('../models/user')
const  bcrypt = require('bcrypt')

// acciones de prueba
const pruebaUser = (req, res) => {
    return res.status(200).send(
        {
            message:'Mensaje enviado desde: controllers/user.js'
        }
    )
}

// registro de usuarios
const register = async (req, res) => {
    // recoger datos de peticion
    let params = req.body;

    // comprobar que me llegan bien los datos (validacion)
    if (!params.name || !params.surname || !params.nick || !params.email || !params.password) {
        return res.status(400).json({
            status: 'error',
            message: 'Faltan datos por enviar'
        });
    }

    try{ 
        // control de usuarios duplicados
        let users = await User.find({
            $or: [
                { email: params.email.toLowerCase() },
                { nick: params.nick.toLowerCase() }
            ]
        }).exec();

        if (users && users.length >= 1) {
            return res.status(200).send({
                status: 'success',
                message: 'El usuario ya esta registrado'
            });
        }

        // cifrar la contraseña
        let pwd = await bcrypt.hash(params.password, 10);
        params.password = pwd;

        // crear objetos de usuario
        let user_to_save = new User(params);

        let userStored = await user_to_save.save();

        return res.status(200).json({
            status: 'success',
            message: 'Usuario registrado con exito',
            user: userStored
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error en la petición de usuarios'
        });
    }
}

module.exports = {
    pruebaUser,
    register
}