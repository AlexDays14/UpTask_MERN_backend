import express from 'express'
import {
    obtenerProyectos, nuevoProyecto,
    obtenerProyecto, editarProyecto,
    buscarColaborador, eliminarProyecto, 
    agregarColaborador, eliminarColaborador,

} from '../controllers/proyectoController.js'
import isAuth from '../middleware/isAuth.js'

const router = express.Router();

router.route('/').get(isAuth, obtenerProyectos).post(isAuth, nuevoProyecto)
router.route('/:id').get(isAuth, obtenerProyecto).put(isAuth, editarProyecto).delete(isAuth, eliminarProyecto)

router.post('/colaboradores', isAuth, buscarColaborador)
router.post('/colaboradores/:id', isAuth, agregarColaborador)
router.put('/colaboradores/:id', isAuth, eliminarColaborador)


export default router