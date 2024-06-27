const { response, request } = require('express');
const bcryptjs = require('bcryptjs');
const Usuario = require('../models/usuario');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const usuariosGet = async(req = request, res = response) => {
    // const {q,nombre = 'no envia', apikey} = req.query;
    const {limite = 5, desde = 0} = req.query; // indicamos que vamos a recibir un parametro: limite, con valor por defecto 5
    const query = {estado: true};

    const limiteNum = Number(limite);
    const desdeNum = Number(desde);
    

    const [total, usuarios] = await Promise.all([
        Usuario.countDocuments(query), // retorna total
        Usuario.find(query) // retorna los usuarios
            .skip(Number(desde))
            .limit(Number(limite))
    ]);

    if (isNaN(limiteNum) || isNaN(desdeNum)) {
        return res.status(400).json({
            msg: "Los parámetros 'limite' y 'desde' deben ser números"
        });
    }
    
    res.json({
        total,
        usuarios
    });
    // encuentra desde al limite registros de la DB
    /* const usuarios = await Usuario.find(query)
        .skip(Number(desde))
        .limit(Number(limite));
    const total = await Usuario.countDocuments(query); */
};

const usuariosPut = async (req, res = response) => {
    const { id } = req.params; // Obtener el ID de los parámetros de la solicitud

    // Validar si el ID es un ObjectId de MongoDB válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            msg: 'El ID proporcionado no es válido' // Enviar un error si el ID no es válido
        });
    }

    // Excluyo password, google y correo (no se actualizan) y todo lo demás lo almaceno en resto
    const {_id,password, google, correo, ...resto } = req.body;

    // Encriptar la contraseña en caso que venga en el body
    if (password) {
        const salt = bcryptjs.genSaltSync(); // Cantidad de vueltas que hará la encriptación por defecto es 10
        resto.password = bcryptjs.hashSync(password, salt); // Encripta el password y lo guarda en resto
    }

    // Actualiza el registro: lo busca por id y actualiza con los valores de resto
    const usuario = await Usuario.findByIdAndUpdate(id, resto, { new: true });

    res.json({
        msg: 'put API - controller',
        usuario // Devuelve el usuario actualizado
    });
};


const usuariosPost = async (req, res = response) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }
    const { nombre, correo, password, rol } = req.body;
    const usuario = new Usuario({ nombre, correo, password, rol });

    // encriptar la contraseña
    const salt = bcryptjs.genSaltSync(); // cantidad de vueltas que hará la encriptación por defecto es 10
    usuario.password = bcryptjs.hashSync(password, salt); // encripta el password

    await usuario.save(); // esto es para grabar en BD

    res.json({
        msg: 'post API - controller',
        usuario
    });
};


const usuariosDelete = async (req, res = response) => {
    const { id } = req.params;
    const uid = req.uid;
    // borrado fisico.
    // const usuario = await Usuario.findByIdAndDelete(id);
    // Borrado lógico del usuario
    const usuario = await Usuario.findByIdAndUpdate(id, { estado: false });

    // Obtener al usuario autenticado desde req.usuario
    const usuarioAutenticado = req.usuario;

    // Responder con el usuario borrado y el usuario autenticado
    res.json({
        usuario
        //usuarioAutenticado
    });
}

const usuariosPatch = (req, res = response) => {
    res.json({
        msg: 'patch API - controller'
    });
};

module.exports = {
    usuariosGet,
    usuariosPut,
    usuariosPost,
    usuariosDelete,
    usuariosPatch
};
