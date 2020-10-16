'use strict'

const express = require('express');
const followController = require('../controllers/followController');

const mdAutenticacion = require('../middlewares/autenticacion');
var api = express.Router();

api.get('/follow/pruebas', followController.prueba);
api.post('/follow/follow', mdAutenticacion.asegurarAutenticacion, followController.saveFollow);
api.delete('/follow/delete/:id', mdAutenticacion.asegurarAutenticacion, followController.deleteFollow);
api.get('/follow/:id?/:page?', mdAutenticacion.asegurarAutenticacion, followController.getFollowingUser);
api.get('/followers/:id?/:page?', mdAutenticacion.asegurarAutenticacion, followController.getFollowedUser);



module.exports = api;