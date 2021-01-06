'use strict'

const express = require('express');
const controller = require('../controllers/publicationController');
const mdAutenticacion = require('../middlewares/autenticacion');

// middleware de connect multiparty para trabajar con ficheros.
var multiPart = require('connect-multiparty');
// middleware con la asignación de la carpeta donde se va a guardar los archivos del usuario.
var mdUploadMultiPart = multiPart({uploadDir: './uploads/users'});

// método router de Express, nos da acceso a los métodos HTTP (GET, POST, PUT, DELETE, etc...)
var api = express.Router();


api.get('/Publication/', mdAutenticacion.asegurarAutenticacion, controller.ObtenerUsuarioPorId);