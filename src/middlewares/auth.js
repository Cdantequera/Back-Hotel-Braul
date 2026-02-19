const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verificar si el usuario está autenticado
const verifyAuth = async (req, res, next) => {
    try {
        let token = req.cookies.token;

        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
            }
        }

        if (!token) {
            return res.status(401).json({
                ok: false,
                message: "No autorizado. Token no encontrado"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({
                ok: false,
                message: "Usuario no encontrado"
            });
        }

        // --- NUEVO: Verificar si el usuario está suspendido ---
        if (!user.active) {
            return res.status(403).json({
                ok: false,
                message: "Cuenta suspendida. Contacta al administrador."
            });
        }

        req.user = user;
        next();

    } catch (error) {
        console.log(error);
        return res.status(401).json({
            ok: false,
            message: "Token inválido o expirado"
        });
    }
}

// Verificar si el usuario es Admin 
const verifyAdmin = (req, res, next) => {
    // Asumimos que en el modelo definimos role: 'admin'
    if(req.user.role !== 'admin') { 
        return res.status(403).json({
            ok: false,
            message: "Acceso denegado. Se requiere ser administrador"
        });
    }
    next();
}

module.exports = {
    verifyAuth,
    verifyAdmin
};