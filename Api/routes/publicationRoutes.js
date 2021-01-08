'use strict'

const express = require('express');
const controller = require('../controllers/publicationController');
const mdAutenticacion = require('../middlewares/autenticacion');

// middleware de connect multiparty para trabajar con ficheros.
var multiPart = require('connect-multiparty');
// middleware con la asignación de la carpeta donde se va a guardar los archivos del usuario.
var mdUploadMultiPart = multiPart({uploadDir: './uploads/publications'});

// método router de Express, nos da acceso a los métodos HTTP (GET, POST, PUT, DELETE, etc...)
const api = express.Router();


api.get('/Publication/prueba', controller.test);

// Guarda una nueva publicación.
api.post('/Publication/save', mdAutenticacion.asegurarAutenticacion, controller.savePublication);

// Obtienen todas las publicaciones que han hecho los seguidores.
api.get('/Publication/getAll/:page?', mdAutenticacion.asegurarAutenticacion, controller.getPublications);


module.exports = api;