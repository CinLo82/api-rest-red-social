const  User = require('../models/user')
const  bcrypt = require('bcrypt')
const jwt = require('../services/jwt')

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
        // Devolver los datos del usuario (sin la contraseña)
        return res.status(200).send({
            status: 'success',
            userProfile
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
        return res.status(200).send({
            status: 'success',
            users,
            total,
            pages: Math.ceil(total / itemsPerPage),
            page,
            itemsPerPage
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

module.exports = {
    pruebaUser,
    register,
    login,
    profile,
    list, 
    update
}