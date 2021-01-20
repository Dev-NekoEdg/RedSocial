'use strict'

const moment = require('moment');
const { Model } = require('mongoose');
const paginate = require('mongoose-pagination');

const messageModel = require('../models/mensajeModel');
const followModel = require('../models/followModel');
const publicationModel = require('../models/publicacionModel');

var usuarioModel = require('../models/usuarioModel');
var encripcion = require('bcrypt-nodejs');
const servicioJwt = require('../services/jwt');
const mensajesConstantes = require('../entidades/mensajesConstantes');

const path = require('path'); // permite trabajar con los archivos.
const fs = require('fs'); // libreria de node para trabajar con Archivos.
const extensionsOk = ['png', 'jpeg', 'jpg', 'gif'];


const { codigoRespuesta } = require('../entidades/mensajesConstantes');
const { mensajeRespuesta } = require('../entidades/mensajesConstantes');


function prueba(request, response) {
    return response.status(codigoRespuesta.Ok).send({ message: mensajeRespuesta.Ok });
}

// POST.
// Guarda un mensaje privado.
function saveMessage(request, response) {
    const parametros = request.body;

    if (!parametros.text || !parametros.receiver) {
        return response.status(codigoRespuesta.Error).send({ message: mensajeRespuesta.Error });
    }

    let newMessage = new messageModel();

    newMessage.sender = request.usuarioLoggedIn.sub;
    newMessage.receiver = parametros.receiver;
    newMessage.mainText = parametros.text;
    newMessage.messageViewed = false;
    newMessage.dateCreated = moment().unix();

    newMessage.save((error, savedMessage) => {

        if (error) {
            return response.status(codigoRespuesta.Error).send({ message: 'Error al enviar el mensaje.' });
        }
        return response.status(codigoRespuesta.Ok).send({ savedMessage });
    });
}


module.exports = {
    prueba,
    saveMessage
}