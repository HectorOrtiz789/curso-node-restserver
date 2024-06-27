const { response, request } = require('express');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario'); // Asegúrate de que esta ruta sea correcta

const validarJWT = async (req = request, res = response, next) => {
    try {
        const token = req.header('x-token');
        //console.log('Token recibido:', token);

        if (!token) {
            return res.status(401).json({
                msg: 'No existe Token en la petición'
            });
        }

        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);
        //console.log('UID del usuario:', uid);

        const usuario = await Usuario.findById(uid);
        //console.log('Usuario encontrado:', usuario);

        if (!usuario) {
            return res.status(401).json({
                msg: 'Token no Válido - Usuario no existe en la base de datos'
            });
        }

        if (!usuario.estado) {
            return res.status(401).json({
                msg: 'Token no Válido - Usuario inactivo (estado = false)'
            });
        }

        req.usuario = usuario;
        req.uid = uid;

        next();
    } catch (error) {
        console.error('Error en validarJWT:', error);
        res.status(401).json({
            msg: 'Token no Válido'
        });
    }
};

module.exports = {
    validarJWT
};
