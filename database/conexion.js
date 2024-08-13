const mongoose = require('mongoose')

const conexion = async() => {
    try {
        await mongoose.connect('mongodb://localhost:27017/mi_redsocial', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log('Conectado correctamente a bd:mi_redsocial')
    } catch (error) {
        console.log(Error)
        throw new Error('No se ha podido conectar a la base de datos')
    }
}

module.exports = {
    conexion
}