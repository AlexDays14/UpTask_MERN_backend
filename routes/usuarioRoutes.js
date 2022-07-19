import express from "express";
const router = express.Router();
import isAuth from '../middleware/isAuth.js'
import { registrar, autenticar, confirmar, olvidePassword, comprobarToken, nuevoPassword, perfil } from "../controllers/usuarioController.js";

/* Autenticación, Registro y Confirmación de Usuarios */

router.post('/', registrar) // REGISTRA NUEVO USUARIO
router.post('/login', autenticar) // LOGIN USUARIO
router.get('/confirmar/:token', confirmar) // CONFIRMAR USUARIO
router.post('/olvide-password', olvidePassword) //SOLICTAR TOKEN PARA RESET PASSWORD
router.route('/olvide-password/:token').get(comprobarToken).post(nuevoPassword) //CONFIRMAR TOKEN RESET PASSWORD Y CAMBIAR PASSWORD
router.get('/perfil', isAuth, perfil)
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export default router