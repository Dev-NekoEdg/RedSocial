'use strict'

var mongoose = require('mongoose');
var schema = mongoose.Schema;

var schemaMassage = schema({
    sender : { type : schema.ObjectId , ref : 'Usuario'},
    receiver : { type : schema.ObjectId , ref : 'Usuario'},
    dateCreated : String,
    mainText: String,
    messageViewed: Boolean
});

module.exports = mongoose.model('Message', schemaMassage);