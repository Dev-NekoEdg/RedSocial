'use strict'

const path = require('path');
const fs = require('fs');

const mongoosePagination = require('mongoose-pagination');

const modeloUsauiro = require('../models/usuarioModel');
const modeloFollow = require('../models/followModel');

function prueba(requeste, response){
    return response.status(200).send({message:'prueba desde controlador de Follows'});
}


module.exports = {
    prueba
}