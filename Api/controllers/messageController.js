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

// GET.
// Obtiene los mensajes que recibe el usuario logueado.
function getReceivedMessages(request, response) {

    const userId = request.usuarioLoggedIn.sub;

    const page = (!request.page ? request.page : 1);

    const itemsPerPage = 5;

    // El segundo parammetro del populate es un string conlos campos que se quiere mostrar.
    // los campos solo separados por espacios.
    messageModel.find({ receiver: userId }).populate('sender', 'UserName _id' ).paginate(page, itemsPerPage, (error, messages, total) => {
        if (error) {
            return response.status(codigoRespuesta.Error).send({ message: 'Error al obtener los mensajes.' });
        }
        
        if (!messages) {
            return response.status(codigoRespuesta.NotFound).send({ message: 'Error al obtener los mensajes.' });
        }
        return response.status(codigoRespuesta.Ok).send({ total,
            pages: Math.ceil(total/itemsPerPage),
            messages,
        });
    });

}

// GET.
// Obtiene los mensajes que he enviado el usuario logueado.
function getSendedMessages(request, response) {

    const userId = request.usuarioLoggedIn.sub;

    const page = (!request.page ? request.page : 1);

    const itemsPerPage = 5;

    // El segundo parammetro del populate es un string conlos campos que se quiere mostrar.
    // los campos solo separados por espacios.
    messageModel.find({ sender: userId }).populate('receiver', 'UserName _id' ).paginate(page, itemsPerPage, (error, messages, total) => {
        if (error) {
            return response.status(codigoRespuesta.Error).send({ message: 'Error al obtener los mensajes.' });
        }
        
        if (!messages) {
            return response.status(codigoRespuesta.NotFound).send({ message: 'Error al obtener los mensajes.' });
        }
        return response.status(codigoRespuesta.Ok).send({ total,
            pages: Math.ceil(total/itemsPerPage),
            messages,
        });
    });

}

// GET.
// Obtiene los mensajes que he enviado el usuario logueado.
function getNoReadMessages(request, response) {

    const userId = request.usuarioLoggedIn.sub;

    const page = (!request.page ? request.page : 1);

    const itemsPerPage = 5;

    // El segundo parammetro del populate es un string conlos campos que se quiere mostrar.
    // los campos solo separados por espacios.
    messageModel.count({ receiver: userId , messageViewed: false }).
    then((value)=> {
        return response.status(codigoRespuesta.Ok).send({ unviewed: value });
    }).
    catch((error)=>{

        if (error) {
            return response.status(codigoRespuesta.Error).send({ message: error });
        }
    });

}

module.exports = {
    prueba,
    saveMessage,
    getReceivedMessages,
    getSendedMessages,
    getNoReadMessages
}