const Follow = require('../models/follow')
const User = require('../models/user')

//importar service
const followService = require('../services/followService')

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

// Accion de listar los usuarios que estoy siguiendo

const following = async (req, res) => {
    try {
        // Obtener el id del usuario logueado
        let userId = req.user.id;
        // comprobar si existe el parametro opcional de la url
        if (req.params.id) userId = req.params.id;

        // si me llega la pagina 
        let page = 1;
        if (req.params.page) page = req.params.page;

        // indicar los usuarios que quiero por pagina
        let itemsPerPage = 4;

        // find a follow, popular datos de los usuarios
        const follows = await Follow.find({ user: userId })
            .populate('followed')
            .select({ '_id': 0, '__v': 0, 'user': 0, 'email':0 })
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage)
            .exec();

        const total = await Follow.countDocuments({ user: userId });

        if (!follows) {
            return res.status(404).send({
                status: 'error',
                message: 'No sigues a ningun usuario'
            });
        }
        // sacar un array de los ids de los usuarios que me siguen y que sigo
        let followUserIds = await followService.followUserIds(req.user.id)

        return res.status(200).send({
            status: 'success',
            total,
            pages: Math.ceil(total / itemsPerPage),
            follows,
            message: 'Lista de usuarios que estoy siguiendo',
            user_following: followUserIds.following,
            user_follow_me: followUserIds.follower
        })

    } catch (error) {
        return res.status(500).send({
            status: 'error',
            message: 'Error en la peticion',
            error
        });
    }
};

// Accion de listar los usuarios que me siguen
const followers = async (req, res) => {
    try {
        // Obtener el id del usuario logueado
        let userId = req.user.id;
        // comprobar si existe el parametro opcional de la url
        if (req.params.id) userId = req.params.id;

        // si me llega la pagina 
        let page = 1;
        if (req.params.page) page = req.params.page;

        // indicar los usuarios que quiero por pagina
        let itemsPerPage = 4;

        // find a follow, popular datos de los usuarios
        const follows = await Follow.find({ followed: userId })
            .populate('user followed')
            .select({ '_id': 0, '__v': 0, 'user': 0, 'email':0 })
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage)
            .exec()

        const total = await Follow.countDocuments({ user: userId });

        let followUserIds = await followService.followUserIds(req.user.id)

        return res.status(200).send({
            status: 'success',
            total,
            pages: Math.ceil(total / itemsPerPage),
            follows,
            message: 'Lista de usuarios que me siguen',
            user_following: followUserIds.following,
            user_follow_me: followUserIds.follower
        })

    } catch (error) {
        return res.status(500).send({
            status: 'error',
            message: 'Error en la peticion',
            error
        });
    }
}

module.exports = {
    pruebaFollow,
    saveFollow,
    unFollow,
    following,
    followers
}