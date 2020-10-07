'use strict'

var mongoose = require('mongoose');
var schema = mongoose.Schema;

var schemaFollow = schema({
    usuarioId : { type : schema.ObjectId , ref : 'Usuario'},
    seguidor : { type : schema.ObjectId , ref : 'Usuario'}
});

module.exports = mongoose.model('Follow', schemaFollow);
