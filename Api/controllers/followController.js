'use strict'

const path = require('path');
const fs = require('fs');

const mongoosePagination = require('mongoose-pagination');

const modeloUsauiro = require('../models/usuarioModel');
const modeloFollow = require('../models/followModel');

const { codigoRespuesta, mensajeRespuesta } = require('../entidades/mensajesConstantes');

function prueba(requeste, response){
    return response.status(200).send({message:'prueba desde controlador de Follows'});
}

function saveFollow(request, response){
    // body para peticiones post.
    const parametros = request.body;
    let newFollow= new modeloFollow();
    newFollow.usuarioId = request.usuarioLoggedIn.sub;
    newFollow.seguidor = parametros.followed;
    
    newFollow.save((error, dataSaved) => {
        if (error){
            return buildResponse(response,codigoRespuesta.Error, { message: mensajeRespuesta.Error } );
        }
        if (!dataSaved) {
            return buildResponse(response,codigoRespuesta.NotFound, { message: mensajeRespuesta.NotFound } );
        }
        
        return buildResponse(response,codigoRespuesta.Ok, dataSaved );
    });

}

function deleteFollow(request, response){
    
    // paramns para peticiones post.
    const idUserFollowed = request.params.id; // recordar que la propiedad del params debe ser igual al que se coloca en la ruta.
    const userId = request.usuarioLoggedIn.sub;

    modeloFollow.deleteOne({'usuarioId' : userId, 'seguidor' : idUserFollowed}, (error, result) => {
        if (error) {
            return buildResponse(response,codigoRespuesta.Error, { message: mensajeRespuesta.Error } );
        }

        return buildResponse(response,codigoRespuesta.Ok, result );
    });
    /*
    // 2020-10-13--> el método de remove está obsoleto.
    modeloFollow.find({'usuarioId' : userId, 'seguidor' : idUserFollowed}).remove((error) => {
        if (error) {
            return buildResponse(response,codigoRespuesta.Error, { message: mensajeRespuesta.Error } );
        }

        return buildResponse(response,codigoRespuesta.Ok, { message: mensajeRespuesta.Ok } );
    });
    */
}
// usuarios que siguimos.
function getFollowingUser(request, response) {
    let userId = request.usuarioLoggedIn.sub;
    
    //const page = (request.params.page ? request.params.page :  1);
    let page = 1;

    if (request.params.id && request.params.page ) {
        userId = request.params.id;
        page = request.params.page;
    }else{
        if (request.params.id && !request.params.page ){
            userId = request.usuarioLoggedIn.sub;
            page = request.params.id
        }
    }

    const itemsPerPage = (request.params.amountRows ? request.params.amountRows : 4);
   
    modeloFollow.find({ 'usuarioId' : userId}).populate({path: 'seguidor'}).
                 paginate(page, itemsPerPage,(error, dataList, total) => {
                     if (error) {
                        return buildResponse(response,codigoRespuesta.Error, { message: mensajeRespuesta.Error } );
                     }

                     if (!dataList) {
                        return buildResponse(response,codigoRespuesta.NotFound, { message: mensajeRespuesta.NotFound } );
                    }
                    var result = { 
                        total,
                        pages: Math.ceil(total/itemsPerPage),
                        dataList
                    }

                    return buildResponse(response,codigoRespuesta.Ok, result );
                 });

}

// usuarios que nos siguen.
function getFollowedUser(request, response) {
    let userId = request.usuarioLoggedIn.sub;
    
    //const page = (request.params.page ? request.params.page :  1);
    let page = 1;

    if (request.params.id && request.params.page ) {
        userId = request.params.id;
        page = request.params.page;
    }else{
        if (request.params.id && !request.params.page ){
            userId = request.usuarioLoggedIn.sub;
            page = request.params.id;
        }
    }

    const itemsPerPage = (request.params.amountRows ? request.params.amountRows : 4);
   
    modeloFollow.find({ 'seguidor' : userId}).populate({path: 'usuarioId'}).
                 paginate(page, itemsPerPage,(error, dataList, total) => {
                     if (error) {
                        return buildResponse(response,codigoRespuesta.Error, { message: mensajeRespuesta.Error } );
                     }

                     if (!dataList) {
                        return buildResponse(response,codigoRespuesta.NotFound, { message: mensajeRespuesta.NotFound } );
                    }
                    var result = { 
                        total,
                        pages: Math.ceil(total/itemsPerPage),
                        dataList
                    }

                    return buildResponse(response,codigoRespuesta.Ok, result );
                 });

}

// Obtiene los serguidores o los que me siguen dependiendo de la request.params.followed, pero sin paginar
// request.params.followed == null ? trae a quien yo sigo : trae a mis seguidores.
function getMyFollows (request, response) {
    const userId = request.usuarioLoggedIn.sub;

    var find = modeloFollow.find({ 'usuarioId' : userId});

    if (request.params.followed) {
        find = modeloFollow.find({ 'seguidor' : userId});
    }

    find.populate('usuarioId seguidor').exec(
        (error, resultData) =>{
            if (error) {
                return buildResponse(response,codigoRespuesta.Error, { message: mensajeRespuesta.Error } );
            }

            if(!resultData){
                return buildResponse(response,codigoRespuesta.NotFound, { message: 'No sigues a ningún usuario' } );
            }

            return buildResponse(response, codigoRespuesta.Ok, resultData );
        }
    );
}



function buildResponse(response, code, objectResponse){
    return response.status(code).send(objectResponse);
}


module.exports = {
    prueba,
    saveFollow,
    deleteFollow,
    getFollowingUser,
    getFollowedUser,
    getMyFollows
}