import express from 'express'
import {
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado,
} from '../controllers/tareaController.js'

import isAuth from '../middleware/isAuth.js'

const router = express.Router();

router.post('/', isAuth, agregarTarea);
router.route('/:id').get(isAuth, obtenerTarea).put(isAuth, actualizarTarea).delete(isAuth, eliminarTarea)
router.post('/estado/:id', isAuth, cambiarEstado)

export default router
