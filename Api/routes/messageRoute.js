'use strict'

const express = require('express');
const messageController = require('../controllers/messageController');

const mdAutenticacion = require('../middlewares/autenticacion');
var api = express.Router();

api.get('/message/pruebas', messageController.prueba);

//Guardar mensaje.
api.post('/message/save', mdAutenticacion.asegurarAutenticacion, messageController.saveMessage);
// api.delete('/follow/delete/:id', mdAutenticacion.asegurarAutenticacion, followController.deleteFollow);
// api.get('/follow/following/:id?/:page?', mdAutenticacion.asegurarAutenticacion, followController.getFollowingUser);
// api.get('/follow/followers/:id?/:page?', mdAutenticacion.asegurarAutenticacion, followController.getFollowedUser);

// api.get('/follow/followsNoPaginate/:followed?', mdAutenticacion.asegurarAutenticacion, followController.getMyFollows);



module.exports = api;