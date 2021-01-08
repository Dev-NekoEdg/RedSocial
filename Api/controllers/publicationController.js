'use strict'

const path = require('path'); // permite trabajar con los archivos.
const fs = require('fs'); // libreria de node para trabajar con Archivos.
const moment = require('moment');
const paginate = require('mongoose-pagination');

const publicationModel = require('../models/publicacionModel');
const userModel = require('../models/usuarioModel');
const followModel = require('../models/followModel');

const mensajesConstantes = require('../entidades/mensajesConstantes');
const { codigoRespuesta, mensajeRespuesta } = require('../entidades/mensajesConstantes');


function prueba(request, response) {

    return response.status(mensajesConstantes.codigoRespuesta.Ok).send({ porpiedad: 'mensaje desde controller pblicacion' });
}

// guardar la publicación.
function savePublication(request, response) {
    // como es un POST se debe usar request.body. request.params es para GET.
    if (!request.body.texto) {
        return createResponse(response, codigoRespuesta.Error, 'Publicación debe tener un texto.');
    }

    let newPublication = new publicationModel();
    newPublication.texto = request.body.texto;
    newPublication.archivo = 'null';
    newPublication.fechaCreacion = moment().unix();;
    newPublication.usuarioId = request.usuarioLoggedIn.sub;

    newPublication.save((error, dataStored) => {
        if (error) {
            return createResponse(response, codigoRespuesta.Error, 'Error al guardar la publicación.');
        }

        if (!dataStored) {
            return createResponse(response, codigoRespuesta.NotFound, 'La publicación nno ha sido guardada.');
        }

        return response.status(codigoRespuesta.Ok).send(dataStored);
    });
}

function getPublications(request, response) {

    let page = 1;
    if (request.params.page) {
        page = request.params.page;
    }

    const itemsPerpage = 5;

    followModel.find({ 'usuarioId': request.usuarioLoggedIn.sub }).populate('seguidor').
        exec().
        then((value) => {
            let arrayFollowed = [];
            value.forEach((follow) => {
                arrayFollowed.push(follow);
            });

            console.log(arrayFollowed);
            // con el "$in" hacemos una busqueda con un array.
            // en este caso obtenemos los seguidores y buscamos las publicaciones que hicieron los nuestros seguidores.
            publicationModel.find({ usuarioId: { "$in": arrayFollowed } }).
                sort('-fechaCreacion'). // supongo que con el"-" delante de la propiedad hace una busqueda descendiente.
                populate('usuarioId'). //hacemos el join con la coleccion de Usuarios por el "usuarioId", que son los seguidores.
                paginate(page, itemsPerpage, (error, data, total) => {
                    if (error) {
                        return createResponse(response, codigoRespuesta.Error, 'Error obteniendo las publicaciones.');
                    }
                    if (!data) {
                        return createResponse(response, codigoRespuesta.NotFound, 'No hay publicaciones.');
                    }

                    return response.status(codigoRespuesta.Ok).send({
                        publications: data,
                        total,
                        pages: Math.ceil(total / 5),
                    });
                });
        }).
        catch((error) => {
            return createResponse(response, codigoRespuesta.Error, 'Error obteniendo los seguidores.');
        });
}


// método encargado de crear una response.
// response: objeto response del método que lo invoca.
// codigo: Entero que indica el código de respuesta Http.
// menssaje: texto que se mostrara en la propiedad 'message' para el usuario que consuma el API.
function createResponse(response, codigo, mensaje) {
    return response.status(codigo).send({ message: mensaje });
}




module.exports = {
    test: prueba,
    savePublication,
    getPublications
}