const rateLimit = require("express-rate-limit");

// Limitador Global
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message:{
        ok: false,
        message: "Demasiadas peticiones desde esta IP, por favor intenta de nuevo en 15 minutos"
    }, 
    standardHeaders: true,
    legacyHeaders: false,
});

// Limitador para Auth (Login/Register)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 20, // Un poco más estricto para auth
    message:{
        ok: false,
        message: "Demasiados intentos de acceso, espera 15 minutos"
    }, 
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { globalLimiter, authLimiter };