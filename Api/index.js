'use strict'

var mongoose = require('mongoose');
var app = require('./app');

var puerto = 3800;

mongoose.Promise = global.Promise;

//conexion a la DB
mongoose.connect('mongodb://localhost:27017/red_social_2020', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("Conexion!!!");
        //Creación del servidor
        app.listen(puerto, () => {
            console.log("servidor http://localhost:3800, arriba!")
        });

    }).catch(err => {
        console.log(err);
    });

/*
Para probar la conexion se debe de colocar en la consola(ejecutando desde el API):
node index.js

*/