'use strict'

var mongoose = require('mongoose');
var schema = mongoose.Schema;

var schemaPublications = schema({
    usuarioId : { type: schema.ObjectId, ref : 'Usuario' }, 
    texto : String,
    archivo : String,
    fechaCreacion : String,
});

module.exports = mongoose.model('Publicacion',schemaPublications);