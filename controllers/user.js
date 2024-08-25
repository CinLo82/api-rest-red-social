const  User = require('../models/user')
const  bcrypt = require('bcrypt')
const jwt = require('../services/jwt')
const fs = require('fs')
const path = require('path')
const followService = require('../services/followService')
const Follow = require('../models/follow')
const Publication = require('../models/publication')

// acciones de prueba
const pruebaUser = (req, res) => {
    return res.status(200).send(
        {
            message:'Mensaje enviado desde: controllers/user.js',
            status: 'success',
            user: req.user
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

const login = async(req, res) => {
    // recoger parametros de body
    let params = req.body;

    // Validar que los parámetros email y password están presentes
    if(!params.email || !params.password) {
        return res.status(400).send({
            status: 'error',
            message: 'Faltan datos por enviar'
        })
        
    }
    // buscar en la base de datos si existen
    try{
        let user = await User.findOne({ email: params.email.toLowerCase() }).exec()
            if (!user) {
                return res.status(404).send({
                    status: 'error',
                    message: 'El usuario no existe'
                });
            }
              //comprobar la contraseña
            const pwd = bcrypt.compareSync(params.password, user.password)

            if (!pwd) {
                return res.status(404).send({
                    status: 'error',
                    message: 'La contraseña es incorrecta'
                });
            }
            
            // si todo es correcto, generar token y devolverlo
            let token = jwt.createToken(user)

             // Devolver los datos del usuario (sin la contraseña)
            return res.status(200).send({
                status: 'success',
                message: 'Te has identificado correctamente',
                user:{
                    id: user._id,
                    name: user.name,
                    surname: user.nick,
                },
                token
            })
          
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error en la petición de usuarios'
        });
    }
}

const profile = async(req, res) => {
    // recoger parametros de id
    const id = req.params.id;

    //consulta para sacar los datos del usuario
    try {
        let userProfile = await User.findById(id)
        .select({ password:0, role:0 })
        .exec()
        if (!userProfile) {
            return res.status(404).send({
                status: 'error',
                message: 'El usuario no existe'
            });
        }

        // Info de seguimientos
        let followInfo = await followService.followThisUser(req.user.id, id)

        // Devolver los datos del usuario (sin la contraseña)

        return res.status(200).send({
            status: 'success',
            userProfile,
            following: followInfo.following,
            follower: followInfo.follower
        })
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error en la petición de usuarios'
        });
    }
}

const list = async(req, res) => {
    //controlar la pagina en la que estamos
    let page = 1;
    if (req.params.page) {
        page = req.params.page
    }
    page = parseInt(page)

    //consulta con mongoose pagination
    try {
        let itemsPerPage = 3;
        let total = await User.countDocuments();
        let users = await User.find()
            .select('-password -email -role -__v')
            .sort('_id')
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage)
            .exec();

        if (!users) {
            return res.status(404).send({
                status: 'error',
                message: 'No hay usuarios disponibles'
            });
        }

        // sacar un array de los ids de los usuarios que me siguen y que sigo
        let followUserIds = await followService.followUserIds(req.user.id)

        return res.status(200).send({
            status: 'success',
            users,
            total,
            pages: Math.ceil(total / itemsPerPage),
            page,
            itemsPerPage,
            user_following: followUserIds.following,
            user_follow_me: followUserIds.follower
        })
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error en la petición de usuarios'
        });
    }
}

const update = async(req, res) => {
    //recoger informacion del usuario a actualizar
    let userToUpdate = req.body;
    const userIdentity = req.user

    //eliminar campos sobrantes
    delete userToUpdate.iat
    delete userToUpdate.exp
    delete userToUpdate.role
    delete userToUpdate.image

    //comprobar que el usuario esta identificado

    try{ 
        // control de usuarios duplicados
        let users = await User.find({
            $or: [
                { email: userToUpdate.email.toLowerCase() },
                { nick: userToUpdate.nick.toLowerCase() }
            ]
        }).exec()

        let userIsset = false
            users.forEach((user) => {
                if(user && user._id != userIdentity.id) userIsset = true
                }
            ) 
        if (userIsset) {
            return res.status(200).send({
                status: 'success',
                message: 'El usuario ya esta registrado'
            });
        }
      
        // cifrar la contraseña
        if(userToUpdate.password){
            let pwd = await bcrypt.hash(userToUpdate.password, 10);
            userToUpdate.password = pwd;
        }else{
            delete userToUpdate.password
        }

         // buscar y actulizar
         let userUpdated = await User
         .findOneAndUpdate({ _id: userIdentity.id }, userToUpdate, { new: true })
         .exec();
            if(!userUpdated){
                return res.status(404).send({
                    status: 'error',
                    message: 'No se ha podido actualizar el usuario'
                });
            }

        // devolver la respuesta

        return res.status(200).json({
            status: 'success',
            message: 'Usuario actualizado',
            userToUpdate,
            userUpdated
        });

    
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error en la petición de usuarios'
        });
    }
}

const upload = async(req, res) => {
    // recoger el fichero de la imagen, y comprobar que existe
    if (!req.file) {
        return res.status(404).send({
            status: 'error',
            message: 'La peticion no incluye la imagen'
        });
    }

    // conseguir el nombre del archivo
    let image = req.file.originalname;

    // sacar la extension
    const imageSplit = image.split('.')
    const extension = imageSplit[imageSplit.length - 1]

    // comprobar la extension, solo imagenes, si no es valida borrar
    if (extension !== 'png' && extension !== 'jpg' && extension !== 'jpeg' && extension !== 'gif') {
        // borrar el archivo
        const filePath = req.file.path
        const fileDelete = fs.unlinkSync(filePath) 
            return res.status(400).send({
                status: 'error',
                message: 'La extension del archivo no es valida'
            })
    }

    //si es correcta guardar en bd
    try{
        const userUpdated = await User.findOneAndUpdate(
            { _id: req.user.id },
            { image: req.file.filename },
            { new: true }
        );
    
        if (!userUpdated) {
            return res.status(500).send({
                status: 'error',
                message: 'Error al guardar la imagen del usuario'
            });
        }
    
        // devolver respuesta
        return res.status(200).send({
            status: 'success',
            userUpdated,
            file: req.file
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error en la petición de usuarios'
        });
    }
}

const avatar = async(req, res) => {
    try{
        // comprobar que me llega el avatar
        if (!req.params.file) {
            return res.status(404).send({
                status: 'error',
                message: 'La imagen no existe'
            })
        }
        //sacar el param de la url
        const file = req.params.file;

        //sacar el path real
        const filePath = './uploads/avatars/' + file;

        //coprobar si existe
        fs.stat(filePath, (error, exists) => {
            if (!exists) {
                return res.status(404).send({
                    status: 'error',
                    message: 'La imagen no existe'
                })
            }
        })
        //devolver la imagen
        return res.sendFile(path.resolve(filePath))
        
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error en la petición de usuarios'
        })
    }
}

const counters = async(req, res) => {
    //recoger el id de la url
    const userId = req.user.id

    if (req.params.id) {
        userId = req.params.id
    }
    try{
        //crear objeto de respuesta
        const following = await Follow.count({ 'user': userId })

        const followed = await Follow.count({ 'followed': userId })

        const publications = await Publication.count({ 'user': userId })

        return res.status(200).send({
            status: 'success',
            userId,
            following: following,
            followed: followed,
            publications: publications
        })

    }
    catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error en los contadores'
        })
    }
}

module.exports = {
    pruebaUser,
    register,
    login,
    profile,
    list, 
    update,
    upload,
    avatar,
    counters
}