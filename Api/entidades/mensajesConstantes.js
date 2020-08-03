'use strinct'

const llaveEncripcion ='llave_encripcion_super_segura_para_jwt';

const codigosMensaje= {
    Ok: 200,
    Unauthorized: 401,
    NotFound: 404,
    Forbidden: 403,
    Error: 500
};

const mensajes = {
    Ok: "Respuesta Exitosa",
    Unauthorized: "No estas Autorizado para acceder a este recurso",
    NotFound: "Recurso no Encontrado",
    Forbidden: "No posees permisos suficientes para acceder a este recurso",
    Error: "Error"
};


module.exports = {
    llaveEncripcion: llaveEncripcion,
    codigoRespuesta: codigosMensaje,
    mensajeRespuesta: mensajes
}