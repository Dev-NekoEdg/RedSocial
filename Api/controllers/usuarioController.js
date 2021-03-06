'use strict'

var usuarioModel = require('../models/usuarioModel');
var encripcion = require('bcrypt-nodejs');
const paginate = require('mongoose-pagination');
const servicioJwt = require('../services/jwt');
const mensajesConstantes = require('../entidades/mensajesConstantes');
const { Model } = require('mongoose');
const path = require('path'); // permite trabajar con los archivos.
const fs = require('fs'); // libreria de node para trabajar con Archivos.
const extensionsOk = ['png', 'jpeg', 'jpg', 'gif'];

const followModel = require('../models/followModel');
const publicationModel = require('../models/publicacionModel');

const { codigoRespuesta } = require('../entidades/mensajesConstantes');

function pruebas(request, response) {

    response.status(200).send({
        codigo: 200,
        message: 'Trololololo',
        numero: 123456
    });
}

function pruebasDos(request, response) {

    response.status(500).send({
        codigo: 500,
        message: 'MAL',
        numero: 0
    });
}

function SaveUser(request, response) {

    //para parametros de Get se usa el request.Params y para Post se usa el request.body.
    var parametros = request.body;
    var newUsuario = new usuarioModel();

    if (parametros.Nombre && parametros.Apellido && parametros.UserName && parametros.Email && parametros.Password) {
        newUsuario.Nombre = parametros.Nombre;
        newUsuario.Apellido = parametros.Apellido;
        newUsuario.UserName = parametros.UserName;
        newUsuario.Email = parametros.Email;
        newUsuario.Password = parametros.Password;

        //Comprobar usuarios duplicados
        usuarioModel.find({
            $or: [{
                Email: newUsuario.Email.toLowerCase()
            },
            {
                UserName: newUsuario.UserName.toLowerCase()
            }
            ]
        }).exec((error, usuarioFound) => {
            if (error) {
                return response.status(500).send({
                    message: "error en la peticion de los usuarios"
                });
            }
            if (usuarioFound && usuarioFound.length >= 1) {
                return response.status(200).send({
                    message: "el correo o el nombre de usuario ya fue registrado."
                });
            } else {
                //Cifrar password y guardar datos
                encripcion.hash(parametros.Password, null, null, (errorHash, datoHash) => {
                    newUsuario.Password = datoHash

                    newUsuario.save((errorUsuario, savedUsuario) => {
                        if (errorUsuario) {
                            return response.status(500).send({
                                mensaje: "Error al guardar."
                            });
                        }

                        if (savedUsuario) {
                            response.status(200).send({
                                usuario: savedUsuario
                            });
                        } else {
                            response.status(404).send({
                                mensaje: "no se pudo registrar al usuario."
                            });
                        }
                    });
                });
            }
        });
    } else {

        response.status(200).send({
            mensaje: "Datos Incompletos"
        });
    }

}

function LoginUsuario(request, response) {
    const user = request.body;

    const nick = user.UserName;
    const mail = user.Email;
    const pass = user.Password;

    usuarioModel.findOne({
        $or: [{
            Email: mail
        }, {
            UserName: nick
        }]
    },
        (error, userFound) => {
            if (error) {
                return response.status(500).send({
                    message: 'ERROR: Usuario no fue encontrado.'
                });
            }

            if (userFound) {
                encripcion.compare(pass, userFound.Password,
                    (errorEncripcion, check) => {
                        if (errorEncripcion) {
                            return response.status(500).send({
                                message: 'Error encripcion de Password.'
                            });
                        }

                        if (check) {
                            /* Antes de enviar el objeto con los datos del usuario encontrado, le asignamos
                            a la propiedad password el valor de undefined para que no lo muestre desde
                            Postman */
                            //userFound.Password = undefined;
                            //return response.status(200).send({usuario : userFound});

                            //se genera el token del usuario encontrado.
                            return response.status(200).send({
                                token: servicioJwt.GenerarTokenLogin(userFound)
                            });
                        } else {
                            return response.status(404).send({
                                message: 'Password incorrecta.'
                            });
                        }
                    });
            } else {
                return response.status(500).send({
                    message: 'Usuario no fue encontrado.'
                });
            }

        });
}

// se crea nueva funcion para ver funcionamiento de async.
function GetUser(request, response) {

    // Cuando llegan datos por url (Get) usamos "params", cuando llegan datos por Post o Put
    // usamos  body.
    const id = request.params.id;
    usuarioModel.findById(id, (error, userFound) => {
        if (error) {
            return response.status(mensajesConstantes.codigoRespuesta.Error).
                send({
                    message: mensajesConstantes.mensajeRespuesta.Error
                });
        }

        if (!userFound) {
            return response.status(mensajesConstantes.codigoRespuesta.NotFound).
                send({
                    message: 'Usuario no encontrado'
                });
        }

        // función Async
        followThisUser(request.usuarioLoggedIn.sub, id).then((valor) => {
            return response.status(codigoRespuesta.Ok).send({
                userFound, following: valor.following, followed: valor.followed
            });
        })


    });
}

// con la palabra reservada "async" creamos funciones asincronas para poder realizar un flujo sincrono.
// las funciones async retorna promesas. Métodos then y catch.
async function followThisUser(identyUserId, userId) {

    var following = await followModel.findOne({ "usuarioId": identyUserId, "seguidor": userId }).
        exec().
        then((dataResult) => {
            return dataResult
        }).
        catch((error) => {
            return handleError(error);
        });

    var followed = await followModel.findOne({ "usuarioId": userId, "seguidor": identyUserId }).
        exec().
        then((dataResult) => {
            return dataResult
        }).
        catch((error) => {
            // handleError: método de Node js para manejar errores por consola.
            return handleError(error);
        });

    return { following, followed }
}

// obtiene un usuario por Id
// 2020-10-20: se modifica para verificar el seguimiento.
function GetUser_Deprecated(request, response) {

    // Cuando llegan datos por url (Get) usamos "params", cuando llegan datos por Post o Put
    // usamos  body.
    const id = request.params.id;
    usuarioModel.findById(id, (error, userFound) => {
        if (error) {
            return response.status(mensajesConstantes.codigoRespuesta.Error).
                send({
                    message: mensajesConstantes.mensajeRespuesta.Error
                });
        }

        if (!userFound) {
            return response.status(mensajesConstantes.codigoRespuesta.NotFound).
                send({
                    message: 'Usuario no encontrado'
                });
        } else {

            // se modifica el método para que tambien indique si el usuario que estoy buscando lo estoy siguiendo.
            followModel.findOne({ "usuarioId": request.usuarioLoggedIn.sub, "seguidor": id }).exec(
                (error, dataResult) => {

                    if (error) {
                        return response.status(mensajesConstantes.codigoRespuesta.Error).send({ message: mensajesConstantes.mensajeRespuesta.Error });
                    }

                    return response.status(mensajesConstantes.codigoRespuesta.Ok).
                        send({
                            usuario: userFound,
                            segidor: dataResult
                        });
                }
            );

            // return response.status(mensajesConstantes.codigoRespuesta.Ok).
            //     send({
            //         usuario: userFound
            //     });
        }
    });
}





// Obtiene todos los usuarios
function GetUsers(request, response) {
    // Tomamos el id del usuario que solicita la lista con el sub(subject) que 
    // indicando el id del claim, del objeto "usuarioLoggedIn" que creamos en el middleware de 
    // autenticación.
    const usuarioActual = request.usuarioLoggedIn;
    //console.log(usuarioActual);

    // Para obtener el valor de url api/Usuario/ObtenerUsuario/2/3, se usa params.
    let page = !request.params.pagina ? 1 : request.params.pagina;
    let itemsPerPage = !request.params.cantidad ? 5 : parseInt(request.params.cantidad, "10");

    // Para obtener el valor de url api/Usuario/ObtenerUsuarios?cantidad=3&pagina=1, se usa query.
    //let page = !request.query.pagina ? 1 : request.query.pagina;
    //let itemsPerPage = !request.query.cantidad ? 5 : parseInt(request.query.cantidad, "10");


    console.log('params.pagina: ' + request.params.pagina);
    console.log('params.cantidad: ' + request.params.cantidad);


    console.log('page: ' + page);
    console.log('itemsPerPage: ' + itemsPerPage);

    usuarioModel.find().sort("UserName").paginate(page, itemsPerPage,
        (error, usersList, count) => {

            if (error) {
                console.log(error);
                return response.status(mensajesConstantes.codigoRespuesta.Error).
                    send({
                        message: mensajesConstantes.mensajeRespuesta.Error
                    });
            }

            if (!usersList) {
                return response.status(mensajesConstantes.codigoRespuesta.NotFound).
                    send({
                        message: "No hay usuarios disponibles..."
                    });
            } else {

                FollowUserId(usuarioActual.sub).then((value) => {

                    return response.status(mensajesConstantes.codigoRespuesta.Ok).
                        send({
                            pages: Math.ceil(count / itemsPerPage),
                            total: count,
                            users: usersList,
                            usersFollowing: value.following,
                            usersFollowed: value.followed
                        });
                });

                // // Usamos la función de Math.ceil("numero") para hacer una aproximación de las páginas.
                // return response.status(mensajesConstantes.codigoRespuesta.Ok).
                //     send({
                //         pages: Math.ceil(count / itemsPerPage),
                //         total: count,
                //         users: usersList
                //     });
            }

        });

}

// Obtiene array con los id de los usuarios que me siguen y un array de los usuarios que sigo.
async function FollowUserId(userId) {

    //con el select({ propiedad: 0}) quitamos la propiedad del select.
    var following = await followModel.find({ "usuarioId": userId }).select({ '_id': 0, '__v': 0, 'usuarioId': 0 }).exec().then((data) => {
        var arrayFollows = [];
        data.forEach((follow) => {
            arrayFollows.push(follow.seguidor);
        });
        return arrayFollows;
    });
    // cuando se tiene el 'then', en la función flecha solo va el  valor del dato obtenido. Dado que el error
    // se obtiene en el 'catch'.
    var followed = await followModel.find({ "seguidor": userId }).select({ '_id': 0, '__v': 0, 'seguidor': 0 }).exec().then((data) => {
        var arrayFollows = [];
        data.forEach((follow) => {
            arrayFollows.push(follow.usuarioId);
        });
        return arrayFollows;
    });

    return {following, followed};
}

// Obtiene el número de 
function GetCounters(request, response) {
    const userId = request.params.id;
    if(userId)
    {
        getCountFollows(userId).then((value)=> {
            return response.status(mensajesConstantes.codigoRespuesta.Ok).
            send(value);
        });

    }
    else{
        getCountFollows(request.usuarioLoggedIn.sub).then((value)=> {
            return response.status(mensajesConstantes.codigoRespuesta.Ok).
            send(value);
        });
    }
}

// Obtiene de manera asincrona los contadores de los follows.
async function getCountFollows(userId){
    var following = await followModel.count({"usuarioId" : userId}).
    then((value) =>{
        return value;
    }).
    catch((error)=>{
        return handleError(error);
    });

    var followed = await followModel.count({"seguidor" : userId}).
    then((value) =>{
        return value;
    }).
    catch((error)=>{
        return handleError(error);
    });

    var publications= await publicationModel.count({"usuarioId" : userId}).
    then((value) =>{
        return value;
    }).
    catch((error)=>{
        return handleError(error);
    });

    return { following, followed, publications } ;
}



// actualiza el id
function UpdateUsers(request, response) {
    var userId = request.params.id
    var userNewData = request.body;

    //borrar la propiedad de password.
    delete userNewData.Password;

    if (userId != request.usuarioLoggedIn.sub) {
        return response.status(mensajesConstantes.codigoRespuesta.Forbidden).send(CreateResponse("No tienes permisoso suficientes para actualizar los datos de este usuario."));
    }

    console.log(userNewData);
    // en el método de findByIdAndUpdate el tercer parametro es un JSon e inindica si se devuelve 
    // el objeto modificado con la propiedad "new" seteada en true.
    usuarioModel.findByIdAndUpdate(userId, userNewData, { new: true }, (error, userUpdated) => {
        if (error) {
            return response.status(mensajesConstantes.codigoRespuesta.Error).send(CreateResponse(mensajesConstantes.mensajeRespuesta.Error));
        }

        if (!userUpdated) {
            return response.status(mensajesConstantes.codigoRespuesta.NotFound).send(CreateResponse("No se pudo actualizar el usuariol."));
        }

        return response.status(mensajesConstantes.codigoRespuesta.Ok).send({ user: userUpdated });
    });


}


function UploadAvatar(request, response) {
    const userId = request.params.id

    if (userId != request.usuarioLoggedIn.sub) {
        //return response.status(mensajesConstantes.codigoRespuesta.Forbidden).send(CreateResponse("No tienes permisoso suficientes para actualizar los datos de este usuario."));

        // se le coloca return para que sagla del método, sino se genera mas de un headers por los returns que se acomulen.
        return removeUploadedFiles(response, filePath, "No tienes permisoso suficientes para actualizar los datos de este usuario.");
    }

    console.log(request.files);
    // Si enviamos algun archivo en la request, podemos tener la propiedad de files.
    if (request.files) {
        // en Postman, en el body, opción form-data el key de la imagen debe ser "image".
        // si no se coloca no se puede leer, dado que files es una propiedad de tipo abjeto, NO de tipo array!
        // por ende cada key es una PROPIEDAD del objeto files, no un elemento de un array.
        const filePath = request.files.image.path;
        console.log(filePath);

        //const fileName = request.files.image.name; //obtien el nombre de la imagen que se sube, mas no, la que se guarda en el server.
        const fileNameSplit = filePath.split('\\');
        const fileName = fileNameSplit[(fileNameSplit.length - 1)];
        console.log(fileName);

        const fileExtSplit = fileName.split('.');
        console.log(fileExtSplit);

        const fileExt = fileExtSplit[1];
        console.log(fileExt);


        if (extensionsOk.indexOf(fileExt.toLowerCase()) >= 0) {
            // Actualiza DB

            // findByIdAndUpdate([objetoId], [propiedad del modelo y valor que queremos cambiar], [indica que retorne el ojeto actualizado], callback error)
            usuarioModel.findByIdAndUpdate(userId, { RutaImagen: fileName }, { new: true }, (error, userUpdated) => {
                if (error) {
                    console.log('Error');
                    return response.status(mensajesConstantes.codigoRespuesta.Error).send(CreateResponse(mensajesConstantes.mensajeRespuesta.Error));
                }

                if (!userUpdated) {
                    console.log('!userUpdated');
                    return response.status(mensajesConstantes.codigoRespuesta.NotFound).send(CreateResponse("No se pudo actualizar el usuariol."));
                }
                console.log('userUpdated:');
                console.log(userUpdated);

                return response.status(mensajesConstantes.codigoRespuesta.Ok).send({ user: userUpdated });
            });

        }
        else {
            // Elimina el archivo subido.
            return removeUploadedFiles(response, filePath, "extensión no valida");
        }

    } else {
        return response.status(mensajesConstantes.codigoRespuesta.Ok).send(CreateResponse("No se ha subido niguna imagen."));
    }

}

// esta funcion es privada, porque no se va a exportar.
function removeUploadedFiles(response, filePath, message) {
    fs.unlink(filePath, (error) => {
        return response.status(mensajesConstantes.codigoRespuesta.Ok).send(CreateResponse(message));
    });

}

// método que retorna la imagen del usuario.
function getImagefile(request, response) {
    const imageFile = request.params.imageFile;
    const mainPath = './uploads/users/';
    const imagePath = mainPath + imageFile;

    // fs.exists --> ya no se usa...
    var exists = fs.existsSync(imagePath); // estar pendiente por si no espera a que verifique si existe la imagen.
    console.log(exists);
    if (exists) {
        response.sendFile(path.resolve(imagePath));
    } else {
        return response.status(mensajesConstantes.codigoRespuesta.Ok).send(CreateResponse('No existe la imagen...'));
    }

}


// Crea el mensaje respuesta para el error.
// msg --> mensaje para colocar en el objeto.
function CreateResponse(msg) {
    var objetoRespuesta = { message: msg }
    return objetoRespuesta;
}

module.exports = {
    pruebas,
    pruebasDos,
    GuardarUsuario: SaveUser,
    LoginUsuario,
    ObtenerUsuarioPorId: GetUser,
    ObtenerUsuarios: GetUsers,
    ActualizarUsuario: UpdateUsers,
    SubirAvatar: UploadAvatar,
    ObtenerAvatar: getImagefile,
    ObtieneContadores: GetCounters
}