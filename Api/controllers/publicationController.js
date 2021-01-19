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
const extensionsOk = ['png', 'jpeg', 'jpg', 'gif'];


function prueba(request, response) {

    return response.status(mensajesConstantes.codigoRespuesta.Ok).send({ porpiedad: 'mensaje desde controller pblicacion' });
}

// POST.
// Guardar la publicación.
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

// GET.
// Metodo que obtiene las publicaciones de los seguidores.
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
                arrayFollowed.push(follow.seguidor);
            });

            // console.log(arrayFollowed);
            // con el "$in" hacemos una busqueda con un array.
            // en este caso obtenemos los seguidores y buscamos las publicaciones que hicieron los nuestros seguidores.
            publicationModel.find({ usuarioId: { "$in": arrayFollowed } }).
                sort('-fechaCreacion'). // supongo que con el"-" delante de la propiedad hace una busqueda descendiente.
                populate('usuarioId'). // hacemos el join con la coleccion de Usuarios por el "usuarioId", que son los seguidores.
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
                        pages: Math.ceil(total / itemsPerpage),
                    });
                });
        }).
        catch((error) => {
            return createResponse(response, codigoRespuesta.Error, 'Error obteniendo los seguidores.');
        });
}

// GET.
// Método que obtiene una publicacion por su Id.
function getPublicationById(request, response) {
    const pubId = request.params.id;

    publicationModel.findById(pubId).
        then((value) => {
            if (!value) {
                return createResponse(response, codigoRespuesta.NotFound, 'Esta publicación no existe');
            }

            return response.status(codigoRespuesta.Ok).send(value);
        }).
        catch((error) => {
            return createResponse(response, codigoRespuesta.Error, error);
        });
}

// GET.
// Método que elimina una publicacion propia del usuario según el Id suministrado.
function deletePublicationById(request, response) {
    const pubId = request.params.id;

    // para buscar por el Id del documento debe ir entre '' con el _ .
    publicationModel.find({ usuarioId: request.usuarioLoggedIn.sub, '_id': pubId }).remove().
        then((value) => {
            if (!value) {
                return createResponse(response, codigoRespuesta.NotFound, 'No se pudo borrar la publicacion.');
            }

            return response.status(codigoRespuesta.Ok).send(value);
        }).
        catch((error) => {
            return createResponse(response, codigoRespuesta.Error, error);
        });
}

// POST.
// Método para cargar una imagen en la publicación.
function UploadImage(request, response) {
    const publicationId = request.params.id

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


        if (extensionsOk.indexOf(fileExt.toLowerCase()) > 0) {

            publicationModel.find({ usuarioId: request.usuarioLoggedIn.sub, '_id': publicationId }).
            then((foundPublication)=>{
                console.log('then del find');
                console.log('foundPublication:');
                console.log(foundPublication);
                // Cuando no encuentra el registro retorna un []. se valida con el .length para que entre al if.
                if (foundPublication.length <= 0)
                    {
                    return createResponse(response, codigoRespuesta.Error, 'No tienes permisos suficientes para modificar esta publicación');
                }
                else{
                    // Actualiza DB
                    // findByIdAndUpdate([objetoId], [propiedad del modelo y valor que queremos cambiar], [indica que retorne el ojeto actualizado], callback error)
                    publicationModel.findByIdAndUpdate(publicationId, { archivo: fileName }, { new: true }, (error, publicationUpdated) => {
                        if (error) {
                            console.log('Error');
                            return response.status(mensajesConstantes.codigoRespuesta.Error).send({message: mensajesConstantes.mensajeRespuesta.Error });
                        }
                        
                        if (!publicationUpdated) {
                            console.log('!publicationUpdated');
                            return response.status(mensajesConstantes.codigoRespuesta.NotFound).send({message: "No se pudo actualizar la publicación."});
                        }
                                                
                        return response.status(mensajesConstantes.codigoRespuesta.Ok).send({ publicationUpdated });
                    });
                }
                    //preihrfg
            }).
            catch((error)=>{
                fs.unlink(filePath, (error) => {
                    return handleError(error);
                });
                return handleError(error);
            });
        }
        else {
            // Elimina el archivo subido.
            return removeUploadedFiles(response, filePath, "extensión no valida");
        }

    } else {
        return response.status(mensajesConstantes.codigoRespuesta.Ok).send({ message:"No se ha subido niguna imagen."});
    }

}

// esta funcion es privada, porque no se va a exportar.
function removeUploadedFiles(response, filePath, message) {
    fs.unlink(filePath, (error) => {
        return response.status(mensajesConstantes.codigoRespuesta.Ok).send({ message });
    });

}

// GET.
// método que retorna la imagen de la Publicación.
 function getImagefile(request, response) {
    const imageFile = request.params.id;
    const mainPath = './uploads/publications/';
    const imagePath = mainPath + imageFile;
    console.log(imagePath);
    // fs.exists --> ya no se usa...
    var exists = fs.existsSync(imagePath); // estar pendiente por si no espera a que verifique si existe la imagen.
    console.log(exists);
    if (exists) {
        response.sendFile(path.resolve(imagePath));
    } else {
        return response.status(mensajesConstantes.codigoRespuesta.Ok).send({message: 'No existe la imagen...'});
    }

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
    getPublications,
    getPublicationById,
    deletePublicationById,
    UploadImage,
    getImagefile
}