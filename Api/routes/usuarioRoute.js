'use strict'

var express = require('express');
var controller = require('../controllers/usuarioController');
var mdAutenticacion = require('../middlewares/autenticacion');

// middleware de connect multiparty para trabajar con ficheros.
var multiPart = require('connect-multiparty');
// middleware con la asignación de la carpeta donde se va a guardar los archivos del usuario.
var mdUploadMultiPart = multiPart({uploadDir: './uploads/users'});

// método router de Express, nos da acceso a los métodos HTTP (GET, POST, PUT, DELETE, etc...)
var api = express.Router();

// con la variable de Express, se obtiene el método HTTP, y como parámetros va la ruta que se debe ver
// desde el navegador y el método del controlador.
api.get('/Usuario/Pruebas', mdAutenticacion.asegurarAutenticacion, controller.pruebas);
api.get('/Usuario/dos', controller.pruebasDos);

api.post('/Usuario/Registro', controller.GuardarUsuario);
api.post('/Usuario/Login', controller.LoginUsuario);
api.get('/Usuario/ObtenerUsuario/:id', mdAutenticacion.asegurarAutenticacion, controller.ObtenerUsuarioPorId);

// Si se usa de esta forma, solo los valores deben viajar por url: http://localhost:3800/api/Usuario/ObtenerUsuarios/2/8.
api.get('/Usuario/ObtenerUsuarios/:pagina/:cantidad?', mdAutenticacion.asegurarAutenticacion, controller.ObtenerUsuarios);

// Si se usa de esta forma, se pueden obtener los valores con el signo ? (api/Usuario/ObtenerUsuarios?pagina=2&cantidad=3).
api.get('/Usuario/ObtenerUsuarios', mdAutenticacion.asegurarAutenticacion, controller.ObtenerUsuarios);

// Url para actualizar el usuario
api.put('/Usuario/ActualizarUsuario/:id', mdAutenticacion.asegurarAutenticacion, controller.ActualizarUsuario);

// Url para subie el avatar del usuario.
// Cuando se necesita más de un  middleware en una ruta se deben de enviar como un array.
api.post('/Usuario/SubirAvatar/:id', [ mdAutenticacion.asegurarAutenticacion, mdUploadMultiPart ], controller.SubirAvatar);

// Url para obtener la imagen del usuario.
api.get('/Usuario/ObtenerAvatar/:imageFile', controller.ObtenerAvatar);


module.exports = api;