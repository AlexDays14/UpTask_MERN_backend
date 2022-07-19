import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import conectarDB from './config/db.js'
import usuarioRoutes from './routes/usuarioRoutes.js'
import proyectoRoutes from './routes/proyectoRoutes.js'
import tareaRoutes from './routes/tareaRoutes.js'

const app = express()
app.use(express.json())

dotenv.config()

conectarDB();

// Configurar CORS
const whitelist = [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_LOCAL_URL,
    process.env.THIS_URL,
    process.env.LOCALHOST_URL,
    process.env.IPHONE
]

const corsOptions = {
    origin: function(origin, callback){
        if(whitelist.includes(origin)){
            //Puede consultar la api
            callback(null, true)
        }else{
            callback(new Error('Error de Cors'))
        }
    }
}

app.use(cors(corsOptions))

//ROUTING

app.use('/api/usuarios', usuarioRoutes);
app.use('/api/proyectos', proyectoRoutes);
app.use('/api/tareas', tareaRoutes);

const PORT = process.env.PORT || 4000;

const servidor = app.listen(PORT, () =>{
    console.log('Corriendo en el puerto 4000')
})

// * Socket.io
import { Server } from 'socket.io'

const io = new Server(servidor, {
    pingTimeout: 60000,
    cors: {
        origin: [process.env.FRONTEND_LOCAL_URL, process.env.FRONTEND_URL]
    }
})

io.on('connection', (socket) => {
    console.log('Conectado a Socket.io')

    // * Definir los eventos de Socket.io
    socket.on('abrir proyecto', (proyectoId) => {
        socket.join(proyectoId)
    })

    socket.on('nueva tarea', (tarea) =>{
        const proyecto = tarea.proyecto
        socket.to(proyecto).emit('tarea agregada', tarea)
    })

    socket.on('eliminar tarea', tarea =>{
        const proyecto = tarea.proyecto
        socket.to(proyecto).emit('tarea eliminada', tarea)
    })

    socket.on('editar tarea', tarea =>{
        const proyecto = tarea.proyecto._id
        socket.to(proyecto).emit('tarea editada', tarea)
    })

    socket.on('completar tarea', tarea =>{
        const proyecto = tarea.proyecto
        socket.to(proyecto).emit('tarea completada', tarea)
    })
})