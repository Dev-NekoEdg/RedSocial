'use strict'

var express = require('express');
var parser = require('body-parser');

var app = express();
var rutaBase = '/api';

//Cargar rutas;
var usuarioRoute = require('./routes/usuarioRoute');
const followRoutes =  require('./routes/followRoute');
//middlewares
//Body-Parser :con esta configuración se va poder interpretar la información en objetos json
app.use(parser.urlencoded({
    extended: false
})); //Configuración necesaria para el body parser
app.use(parser.json());

//cores

//rutas
app.use(rutaBase, usuarioRoute);
app.use(rutaBase, followRoutes)
/*
el app.use nos permite usar middlewares. El middleware hace es un proceso intermedio y el app.use hace 
que el middleware se ejecute antes de ejecutar la acción del controlador.
*/

app.get('/pruebas', (request, response) => {

    response.status(200).send({
        message: 'mensaje de pruebas del servicio Web Api para la aplicación de Red Social'
    });
});


//exports
module.exports = app;