const  User = require('../models/user')

// acciones de prueba
const pruebaUser = (req, res) => {
    return res.status(200).send(
        {
            message:'Mensaje enviado desde: controllers/user.js'
        }
    )
}

// registro de usuarios
const register = (req, res) => {
    //recoger datos de peticion
    let params = req.body

    //comprobar que me llegan bien los datos(validacion)
    if (!params.name || !params.surname || !params.nick || !params.email || !params.password) {
        return res.status(400).json(
            {
                status: 'error',
                message: 'Faltan datos por enviar'
            }
        )
    }

    //crear objetos de usuario
    let user_to_save = new User(params)

    //control de usuarios duplicados
    User.find({
        $or: [
            {email: user_to_save.email.toLowerCase()},
            {nick: user_to_save.nick.toLowerCase()}
        ]
    }).exec((error, users) => {
        if (error) {
            return res.status(500).json(
                {
                    status: 'error',
                    message: 'Error en la petición de usuarios'
                }
            )
        }
        if (users && users.length >= 1) {
            return res.status(200).send(
                {
                    status: 'success',
                    message: 'El usuario ya esta registrado'
                }
            )
        }
       
    })

    //cifrar la contraseña

    //guardar usuario en la base de

    //devolver el resultado

    return res.status(200).json(
        {
            status: 'success',
            message:'Acción de registro de usuario',
            user_to_save
        }
    )
}

module.exports = {
    pruebaUser,
    register
}