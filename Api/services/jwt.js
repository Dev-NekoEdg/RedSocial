'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');

//Llave de encripcion para encriptar los tokens de autenticación de JWT.
const llaveEncripcion = 'llave_encripcion_super_segura_para_jwt';

function GetTokenUsuario(user){
    /*
    El objeto entityToEncrypt es el payload que se va a enviar a JWT.
    este es un register claim y por eso se le coloca las propiedades de:
    sub(subject), indicando el id del claim.
    iat(Issued At) indica la fecha en que se creo el token.
    exp(tiempo de expiración), indica el tiempo en el que el token es valido.
    */ 
    const entityToEncrypt = {
        sub: user._id,
        name: user.Nombre,
        lastName: user.Apellido,
        userName: user.UserName,
        Email: user.Email,
        pass: user.Password,
        role: user.Rol,
        image: user.RutaImagen,
        iat: moment().unix(),
        exp: moment().add(5, 'days').unix()
    };
    return jwt.encode(entityToEncrypt, llaveEncripcion);
}

module.exports = {
    GenerarTokenLogin: GetTokenUsuario
}