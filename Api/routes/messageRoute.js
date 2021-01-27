'use strict'

const express = require('express');
const messageController = require('../controllers/messageController');

const mdAutenticacion = require('../middlewares/autenticacion');
var api = express.Router();

api.get('/message/pruebas', messageController.prueba);

// Guardar mensaje.
api.post('/message/save', mdAutenticacion.asegurarAutenticacion, messageController.saveMessage);

// Obtiene los mensajes que recibe el usuario logueado.
api.get('/message/myMessages/:page?', mdAutenticacion.asegurarAutenticacion, messageController.getReceivedMessages);

// Obtiene los mensajes que he enviado el usuario logueado.
api.get('/message/messages/:page?', mdAutenticacion.asegurarAutenticacion, messageController.getSendedMessages);

api.get('/message/countNoReadMessages/:page?', mdAutenticacion.asegurarAutenticacion, messageController.getNoReadMessages);


// api.get('/follow/followsNoPaginate/:followed?', mdAutenticacion.asegurarAutenticacion, followController.getMyFollows);



module.exports = api;