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

//listar todas las publicaciones

//listar public

//borrar publicacion

//subir archivos de imagen/avatar de usuario

//obtener archivo de imagen/avatar de usuario

module.exports = {
    pruebaPublication,
    savePublication,
    detailPublication
}