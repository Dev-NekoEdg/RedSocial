'use strict'

const express = require('express');
const followController = require('../controllers/followController');

const mdAutenticacion = require('../middlewares/autenticacion');
var api = express.Router();

api.get('/follow/pruebas', followController.prueba);



module.exports = api;