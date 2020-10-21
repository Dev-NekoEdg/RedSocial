'use strict'

const express = require('express');
const followController = require('../controllers/followController');

const mdAutenticacion = require('../middlewares/autenticacion');
var api = express.Router();

api.get('/follow/pruebas', followController.prueba);
api.post('/follow/save', mdAutenticacion.asegurarAutenticacion, followController.saveFollow);
api.delete('/follow/delete/:id', mdAutenticacion.asegurarAutenticacion, followController.deleteFollow);
api.get('/follow/following/:id?/:page?', mdAutenticacion.asegurarAutenticacion, followController.getFollowingUser);
api.get('/follow/followers/:id?/:page?', mdAutenticacion.asegurarAutenticacion, followController.getFollowedUser);

api.get('/follow/followsNoPaginate/:followed?', mdAutenticacion.asegurarAutenticacion, followController.getMyFollows);



module.exports = api;