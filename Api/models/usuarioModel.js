'use strinct'

var mongoose = require('mongoose');
var schema = mongoose.Schema;

var usuarioSchema = schema({
Nombre: String,
Apellido: String,
UserName:String,
Email: String,
Password: String,
Rol: String,
RutaImagen: String
});

module.exports = mongoose.model("Usuario",usuarioSchema, "usuario");