const Publication = require('../models/publication');

const pruebaPublication = (req, res) => {
    return res.status(200).send(
        {
            message:'Mensaje enviado desde: controllers/publication.js'
        }
    )
}

//guardar publicacion
const savePublication = async (req, res) => {
    //recoger los datos dle body
    const params = req.body
    if (!params.text) 
        return res.status(200).send({ 
            status: 'error',
            message: 'Debes enviar un texto'
        })

    try {
            //crear objeto de publicacion
        let newPublication = new Publication()
        newPublication.user = req.user.id
        newPublication.text = params.text
            //guardar publicacion en la base de datos
        const publicationStored = await newPublication.save()
        if (!publicationStored) 
            return res.status(404).send({
         message: 'La publicación no ha sido guardada' 
        })
        return res.status(200).send({ 
            newPublication: publicationStored 
        })
    } catch (error) {
        return res.status(500).send({ 
            message: 'Error al guardar la publicación' 
        })
    }
}

const detailPublication = async (req, res) => {
    //recoger el id de la publicacion
    const publicationId = req.params.id
    try {
        //buscar la publicacion en la base de datos
        const publication = await Publication.findById(publicationId)
        .populate('user')
        .exec()
        if (!publication) 
            return res.status(404).send({
                message: 'No existe la publicación'
            })
            
        return res.status(200).send({
            publication
        })

    }
    catch (error) {
        return res.status(500).send({
            message: 'Error al buscar la publicación'
        })
    }
}

//borrar publicacion
const deletePublication = async (req, res) => {
    try {
        // recoger el id de la publicacion
        const publicationId = req.params.id;

        // buscar y borrar la publicacion en la base de datos
        const publicationRemoved = await Publication.findOneAndDelete({ user: req.user.id, '_id': publicationId });

        // comprobar si se ha borrado la publicacion
        if (!publicationRemoved) {
            return res.status(404).send({
                status: 'error',
                message: 'No existe la publicación'
            });
        }

        return res.status(200).send({
            status: 'success',
            message: 'La publicación ha sido removida',
            publication: publicationRemoved
        });

    } catch (error) {
        return res.status(500).send({
            message: 'Error al borrar la publicación',
            error: error.message 
        });
    }
}

// listar las publicaciones de un usuario
    const userPublications = async (req, res) => {
        try {
            // recoger el id del usuario
            const userId = req.params.id;

            //controlar la pagina
            let page = 1;
            if (req.params.page) {
                page = req.params.page;
            }

            const itemsPerPage = 4;

             // contar el número total de publicaciones del usuario
            const totalPublications = await Publication.countDocuments({ user: userId });

            // calcular el número total de páginas
            const totalPages = Math.ceil(totalPublications / itemsPerPage);

            //find, populate, ordenar, agregar paginacion
            const publications = await Publication.find({ user: userId })
                .sort('-created_at')
                .populate('user', '-password -__v -role') 
                .skip((page - 1) * itemsPerPage)
                .limit(itemsPerPage)
                .exec();

            if(!publications || publications.length === 0) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay publicaciones para mostrar'
                });
            }
    
            return res.status(200).send({
                status: 'success',
                page,
                itemsPerPage,
                totalPublications,
                totalPages,
                publications,
            });

        } catch (error) {
            return res.status(500).send({
                message: 'Error al buscar las publicaciones',
                error: error.message
            });
        }
    }  

//subir archivos de imagen/avatar de usuario

//obtener archivo de imagen/avatar de usuario

module.exports = {
    pruebaPublication,
    savePublication,
    detailPublication,
    deletePublication,
    userPublications
}