const { response } = require("express");

const esAdminRole = (req, res = response, next) => {
    try {
        if (!req.usuario) {
            return res.status(500).json({
                msg: 'Se quiere validar el Rol, sin validar token primero'
            });
        }

        const { rol, nombre } = req.usuario;
        //console.log('Rol del usuario:', rol);

        if (rol !== 'ADMIN_ROLE') {
            return res.status(401).json({
                msg: `${nombre} no es Administrador - No está autorizado`
            });
        }

        next();
    } catch (error) {
        console.error('Error en esAdminRole:', error);
        res.status(500).json({
            msg: 'Error al validar el Rol'
        });
    }
};

const tieneRole = (...roles) => {
    return (req, res = response, next) => {
        if (!req.usuario) {
            return res.status(500).json({
                msg: 'Se quiere validar el Rol, sin validar token primero'
            });
        }
        // Ojo: en roles están ingresando los roles admitidos (admin, ventas)
        if (!roles.includes(req.usuario.rol)) {
            return res.status(401).json({
                msg: `El sistema requiere uno de estos roles ${roles}`
            });
        }
        next();
    }
}

module.exports = {
    esAdminRole,
    tieneRole
};
