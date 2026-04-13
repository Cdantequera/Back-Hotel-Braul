const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { createMessage, getMessages, markAsRead, deleteMessage } = require('../controllers/contact.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Configuración del Rate Limit para detener Spam (Peticiones POST a contacto)
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 Minutos de ventana
    max: 5, // Límite de 5 peticiones por IP en esa ventana
    message: { ok: false, message: "Has enviado demasiados mensajes. Por favor, intenta de nuevo más tarde." },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Rutas Públicas
// Aplicamos limite de intentos al crear mensaje
router.post('/', contactLimiter, createMessage);

// Rutas Privadas (Admin)
router.get('/', verifyToken, isAdmin, getMessages);
router.patch('/:id/read', verifyToken, isAdmin, markAsRead);
router.delete('/:id', verifyToken, isAdmin, deleteMessage);

module.exports = router;
