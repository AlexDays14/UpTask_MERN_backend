import Proyecto from "../models/Proyecto.js"
import mongoose from "mongoose"
import Usuario from "../models/Usuario.js"

const obtenerProyectos = async (req, res) =>{
    const proyectos = await Proyecto.find({
        '$or' : [
            {'colaboradores': {$in: req.usuario}},
            {'creador': {$in: req.usuario}},
        ]
    }).select('-tareas -createdAt -updatedAt -__v')
    res.json(proyectos)
}

const nuevoProyecto = async (req, res) =>{
    const proyecto = new Proyecto(req.body)
    proyecto.creador = req.usuario._id

    try {
        const proyectoAlmacenado = await proyecto.save();
        res.json(proyectoAlmacenado)
    } catch (error) {
        console.log(error)
    }
}

const obtenerProyecto = async (req, res) =>{
    const { id } = req.params
    if(mongoose.Types.ObjectId.isValid(id) == false){
        const error = new Error('Id No Válido')
        return res.status(401).json({msg: error.message})
    }
    
    const proyecto = await Proyecto.findById(id).populate({path: 'tareas', select: "-createdAt -updatedAt -__v", populate: {path: 'completado', select: "nombre email"}}).populate('colaboradores', 'nombre email')

    if(!proyecto){
        const error = new Error('No Encontrado')
        return res.status(404).json({msg: error.message})
    }
    if(proyecto.creador.toString() !== req.usuario._id.toString() && !proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString())){
        const error = new Error('Acción No Válida')
        return res.status(401).json({msg: error.message})
    }

    res.json(
        proyecto
    )
}

const editarProyecto = async (req, res) =>{
    const { id } = req.params
    if(mongoose.Types.ObjectId.isValid(id) == false){
        const error = new Error('Id No Válido')
        return res.status(401).json({msg: error.message})
    }

    const proyecto = await Proyecto.findById(id)
    if(!proyecto){
        const error = new Error('No Encontrado')
        return res.status(404).json({msg: error.message})
    }
    if(proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('Acción No Válida')
        return res.status(401).json({msg: error.message})
    }

    proyecto.nombre = req.body.nombre || proyecto.nombre
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion
    proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega
    proyecto.cliente = req.body.cliente || proyecto.cliente

    try {
        const proyectoAlmacenado = await proyecto.save()
        res.json(proyectoAlmacenado)
    } catch (error) {
        console.log(error)
    }
}

const eliminarProyecto = async (req, res) =>{
    const { id } = req.params
    if(mongoose.Types.ObjectId.isValid(id) == false){
        const error = new Error('Id No Válido')
        return res.status(401).json({msg: error.message})
    }

    const proyecto = await Proyecto.findById(id)
    if(!proyecto){
        const error = new Error('No Encontrado')
        return res.status(404).json({msg: error.message})
    }
    if(proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('Acción No Válida')
        return res.status(401).json({msg: error.message})
    }

    try {
        await proyecto.deleteOne()
        res.json({msg: 'Proyecto Eliminado Correctamente'})
    } catch (error) {
        console.log(error)
    }
}

const buscarColaborador = async (req, res) =>{
    const { email, creador } = req.body
    
    const usuario = await Usuario.findOne({email}).select('-password -createdAt -updatedAt -token -confirmado -__v')
    if(!usuario){
        const error = new Error('Usuario No Encontrado')
        return res.status(404).json({msg: error.message})
    }
    // * El colaborador no es el dueño del proyecto
    if(creador === usuario._id.toString()){
        const error = new Error('No puedes agregarte como colaborador')
        return res.status(401).json({msg: error.message})
    }
    res.json(usuario)
}

const agregarColaborador = async (req, res) =>{
    const { id } = req.params
    if(mongoose.Types.ObjectId.isValid(id) == false){
        const error = new Error('Id No Válido')
        return res.status(401).json({msg: error.message})
    }

    const proyecto = await Proyecto.findById(id)
    if(!proyecto){
        const error = new Error('No Encontrado')
        return res.status(404).json({msg: error.message})
    }
    if(proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('Acción No Válida')
        return res.status(401).json({msg: error.message})
    }

    const { email } = req.body
    const usuario = await Usuario.findOne({email}).select('-password -createdAt -updatedAt -token -confirmado -__v')
    if(!usuario){
        const error = new Error('Usuario No Encontrado')
        return res.status(404).json({msg: error.message})
    }

    // * El colaborador no es el dueño del proyecto
    if(proyecto.creador.toString() === usuario._id.toString()){
        const error = new Error('No puedes agregarte como colaborador')
        return res.status(401).json({msg: error.message})
    }

    // * Revisar que no esté ya agregado al proyecto
    if(proyecto.colaboradores.includes(usuario._id)){
        const error = new Error('Este usuario ya pertenece al proyecto')
        return res.status(401).json({msg: error.message})
    }

    proyecto.colaboradores.push(usuario._id)
    await proyecto.save()
    res.json({msg: 'Colaborador Agregado Correctamente'})
}

const eliminarColaborador = async (req, res) =>{
    const { id } = req.params
    if(mongoose.Types.ObjectId.isValid(id) == false){
        const error = new Error('Id No Válido')
        return res.status(401).json({msg: error.message})
    }

    const proyecto = await Proyecto.findById(id)
    if(!proyecto){
        const error = new Error('No Encontrado')
        return res.status(404).json({msg: error.message})
    }
    if(proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('Acción No Válida')
        return res.status(401).json({msg: error.message})
    }

    proyecto.colaboradores.pull(req.body.id)
    await proyecto.save()
    res.json({msg: 'Colaborador eliminado correctamente'})
}

export{
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    buscarColaborador,
    agregarColaborador,
    eliminarColaborador,
}

