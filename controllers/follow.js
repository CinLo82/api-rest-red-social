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

const unFollow = async (req, res) => {
    // Obtener el id del usuario logueado
    const userId = req.user.id

    //recoger el id del usuario que sigo y quiero dejar de seguir
    const followedId = req.params.id

    //find de las coincidencias y hacer un delete
    try {
        await Follow.deleteOne({ user: userId, followed: followedId });
        return res.status(200).send({
            status: 'success',
            message: 'Follow eliminado correctamente',
            userId,
            followedId
        });
    } catch (err) {
        return res.status(500).send({
            status: 'error',
            message: 'Error al borrar el follow',
            err
        });
    }
    
}
// Accion de eliminar un follow (accion dejar de seguir)

// Accion de listar los usuarios que estoy siguiendo

// Accion de listar los usuarios que me siguen

module.exports = {
    pruebaFollow,
    saveFollow,
    unFollow
}