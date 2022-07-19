import nodemailer from 'nodemailer'

export async function confirmarCuenta(datos){
    const { email, nombre, token } = datos;
    
    const transport = nodemailer.createTransport({
        host: process.env.HOST_EMAIL,
        port: process.env.PORT_EMAIL,
        secure: true,
        auth: {
          user: process.env.USER_EMAIL,
          pass: process.env.PASS_EMAIL
        }
    });

    const info = await transport.sendMail({
        from: '"UpTask - Administrador de Proyectos" <cuentas@uptask.com>',
        to: email,
        subject: "UpTask - Confirmar tu cuenta",
        text: "Comprueba tu cuenta en UpTask",
        html: `<p>Hola: ${nombre}, Confirma tu cuenta en UpTask</p>
        <p>Estás a un paso de tener tu cuenta lista, solo confirma tu cuenta y actívala en el siguiente enlace:</p>

        <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Confirma Aquí</a>

        <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje.</p>
        `
    })

}

export async function resetearPassword(datos){
    const { email, nombre, token } = datos;
    
    const transport = nodemailer.createTransport({
        host: process.env.HOST_EMAIL,
        port: process.env.PORT_EMAIL,
        auth: {
          user: process.env.USER_EMAIL,
          pass: process.env.PASS_EMAIL
        }
    });

    const info = await transport.sendMail({
        from: '"UpTask - Administrador de Proyectos" <cuentas@uptask.com>',
        to: email,
        subject: "UpTask - Reestablece tu Contraseña",
        text: "Recupera tu cuenta de UpTask",
        html: `<p>Hola: ${nombre},</p>
        <p>Reestablece tu contraseña en el siguiente enlace:</p>

        <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablecer Contraseña</a>

        <p>Si tu no solicitaste esta acción, puedes ignorar el mensaje.</p>
        `
    })

}