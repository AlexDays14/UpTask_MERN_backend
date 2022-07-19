import mongoose from 'mongoose'
import Proyecto from '../models/Proyecto.js'
import Tarea from '../models/Tarea.js'

const agregarTarea = async (req, res) =>{
    const { proyecto } = req.body

    if(mongoose.Types.ObjectId.isValid(proyecto) == false){
        const error = new Error('Id No Válido')
        return res.status(404).json({msg: error.message})
    }

    const existeProyecto = await Proyecto.findById(proyecto)
    if(!existeProyecto){
        const error = new Error('No Encontrado')
        return res.status(404).json({msg: error.message})
    }
    if(existeProyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('Acción No Válida')
        return res.status(403).json({msg: error.message})
    }

    try {
        const tareaAlmacenada = await Tarea.create(req.body)
        // * Alamacenar el id de la TAREA en el PROYECTO
        existeProyecto.tareas.push(tareaAlmacenada._id)
        const proyectoActualizado = await existeProyecto.save()
        return res.json(tareaAlmacenada)
    } catch (error) {
        console.log(error)
    }
}

const obtenerTarea = async (req, res) =>{
    const { id } = req.params

    if(mongoose.Types.ObjectId.isValid(id) == false){
        const error = new Error('Id No Válido')
        return res.status(404).json({msg: error.message})
    }

    const tarea = await Tarea.findById(id).populate('proyecto');
    if(!tarea){
        const error = new Error('Tarea No Encontrada')
        return res.status(404).json({msg: error.message})
    }

    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('Acción No Válida')
        return res.status(403).json({msg: error.message})
    }

    res.json({tarea})

}

const actualizarTarea = async (req, res) =>{
    const { id } = req.params

    if(mongoose.Types.ObjectId.isValid(id) == false){
        const error = new Error('Id No Válido')
        return res.status(404).json({msg: error.message})
    }

    const tarea = await Tarea.findById(id).populate('proyecto');
    if(!tarea){
        const error = new Error('Tarea No Encontrada')
        return res.status(404).json({msg: error.message})
    }

    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('Acción No Válida')
        return res.status(403).json({msg: error.message})
    }

    tarea.nombre = req.body.nombre || tarea.nombre;
    tarea.descripcion = req.body.descripcion || tarea.descripcion;
    tarea.prioridad = req.body.prioridad || tarea.prioridad;
    tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega;

    try {
        await tarea.save()
        const tareaRespuesta = await Tarea.findById(id).populate('completado').populate('proyecto')
        res.json(tareaRespuesta)
    } catch (error) {
        console.log(error)
    }
}

const eliminarTarea = async (req, res) =>{
    const { id } = req.params

    if(mongoose.Types.ObjectId.isValid(id) == false){
        const error = new Error('Id No Válido')
        return res.status(404).json({msg: error.message})
    }

    const tarea = await Tarea.findById(id).populate('proyecto');
    if(!tarea){
        const error = new Error('Tarea No Encontrada')
        return res.status(404).json({msg: error.message})
    }

    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('Acción No Válida')
        return res.status(403).json({msg: error.message})
    }

    try {
        const proyecto = await Proyecto.findById(tarea.proyecto)
        proyecto.tareas = proyecto.tareas.pull(tarea._id)

        await Promise.allSettled([await proyecto.save(), await tarea.deleteOne()])

        res.json({msg: 'Tarea Eliminada Correctamente'})
    } catch (error) {
        console.log(error)
    }
}

const cambiarEstado = async (req, res) =>{
    const { id } = req.params

    if(mongoose.Types.ObjectId.isValid(id) == false){
        const error = new Error('Id No Válido')
        return res.status(404).json({msg: error.message})
    }

    const tarea = await Tarea.findById(id).populate('proyecto').select("-updatedAt -createdAt -__v");
    if(!tarea){
        const error = new Error('Tarea No Encontrada')
        return res.status(404).json({msg: error.message})
    }
    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString() && !tarea.proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString())){
        const error = new Error('Acción No Válida')
        return res.status(403).json({msg: error.message})
    }
    if(tarea.completado && tarea.completado.toString() !== req.usuario._id.toString() && tarea.proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('No puedes modificar una tarea completada por otra persona')
        return res.status(403).json({msg: error.message})
    }

    tarea.estado = !tarea.estado
    if(tarea.estado){
        tarea.completado = req.usuario._id
    }else{
        tarea.completado = null
    }
    await tarea.save()
    const tareaAlmacenada = await Tarea.findById(id).populate('completado')
    res.json(tareaAlmacenada)
}

export{
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado,
}