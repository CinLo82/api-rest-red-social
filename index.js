// coneccion a base de datos
const { conexion } = require('./database/conexion')
const express = require('express')
const cors = require('cors')

//mensaje de bienvenida
console.log('API NODE para la red social arrancada!!')
//crear servidor node
const app = express()
const puerto = 3900

conexion()

//configurar cors
app.use(cors())

// convertir los datos del body a objeto js
app.use(express.json())
app.use(express.urlencoded({extended:true}))

// cargar config de rutas
const UserRoutes = require('./routes/user')
const FollowRoutes = require('./routes/follow')
const PublicationRoutes = require('./routes/publication')

// cargar rutas
app.use('/api/user', UserRoutes)
app.use('/api/follow', FollowRoutes)
app.use('/api/publication', PublicationRoutes)

//ruta de prueba
app.get("ruta-prueba", (req, res) => {
    return res.status(200).json(
        {
            'id':1,
            'nombre':'Ruta de prueba',
            'descripcion':'Esta es una ruta de prueba'
        }
    )
})

// poner servidor a escuchar peticiones http
app.listen(puerto, () => {
    console.log(`Servidor corriendo en http://localhost:${puerto}`)
})

