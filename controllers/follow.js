const Follow = require('../models/follow')
const user = require('../models/user')
const User = require('../models/user')

const pruebaFollow = (req, res) => {
    return res.status(200).send(
        {
            message:'Mensaje enviado desde: controllers/follow.js'
        }
    )
}

// Accion de guardar un follow (accion seguir)
const saveFollow = async (req, res) => {
    // Obtener los parametros que llegan por POST
    const params = req.body

    // Sacar el id del usuario identificado
    const identity = req.user

    // crear objeto con modelo follow
    const userToFollow = new Follow({
        user: identity.id,
        followed: params.followed
    })

    // guardar el objeto en la base de datos
    await userToFollow.save()
        .then(() => {
            return res.status(200).send({ 
                status: 'success',
                message: 'Metodo saveFollow',
                identity: req.user,
                params, 
                userToFollow
            })
        })
        .catch((err) => {
            return res.status(500).send({ 
                status: 'error',
                message: 'Error al guardar el follow',
                err
            })
        })
   

}

// Accion de eliminar un follow (accion dejar de seguir)

// Accion de listar los usuarios que estoy siguiendo

// Accion de listar los usuarios que me siguen

module.exports = {
    pruebaFollow,
    saveFollow
}