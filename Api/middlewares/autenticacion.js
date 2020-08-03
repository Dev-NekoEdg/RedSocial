'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');
const respuesta = require('../entidades/mensajesConstantes');

// creamos el método para verificar el token.
// la function asegurarAutenticacion tendra los 3 parametros de request, response y next. "next" actuara como apuntador al 
// método que se debe ejecutar después de que el token se valido correctamente.
exports.asegurarAutenticacion = function(request, response, next) {
    if (!request.headers.authorization) {
        return response.status(respuesta.codigoRespuesta.Forbidden).
        send({
            message: respuesta.mensajeRespuesta.Forbidden
        });
    }
    // En el replace indicamos que vamos a reemplazar el los caracteres de comillas dobles --> "  y 
    // de comillas simples --> ' en la cadena del token.
    // la expresión regular buscará los caracteres colocados dentro de [].
    // más info: https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Regular_Expressions
    const token = request.headers.authorization.replace(/['"]+/g, '');
    let usuario = undefined;

    try {
        // datos del usuario o payload.
        usuario = jwt.decode(token, respuesta.llaveEncripcion);
        if (usuario.exp < moment.unix()) {
            return response.status(respuesta.codigoRespuesta.Unauthorized).
            send({
                message: respuesta.mensajeRespuesta.Unauthorized + ': El token ha Expirado'
            });
        }

    } catch (error) {
        return response.status(respuesta.codigoRespuesta.NotFound).
        send({ 
            message: 'El token no es valido'
        });
    }
    // Creamos una propiedad en tiempo de ejecución al objeto de request, con los datos, en limpio, del usuario 
    // logueado para poder usarlos en los métodos que se requiera.
    request.usuarioLoggedIn = usuario;

    next();
}