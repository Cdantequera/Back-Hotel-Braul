const express = require("express");
const router = express.Router();

// 1. Importar Controlador
const authController = require("../controllers/auth.controller");
const { 
    register, 
    login, 
    verifyEmail, 
    logout, 
    getUserProfile,
    forgotPassword,
    resetPassword,
    googleLogin
} = authController;

// 2. Importar Validadores
const validator = require("../middlewares/validator");
const { 
    validateRegister, 
    validateLogin, 
    validateVerifyEmail,
    validateForgotPassword, 
    validateResetPassword
} = validator;

// 3. Importar Middlewares
const rateLimiter = require("../middlewares/rate.limiter");
const authMiddleware = require("../middlewares/auth");

const { authLimiter } = rateLimiter;
const { verifyAuth } = authMiddleware;

// --- RUTAS PÚBLICAS ---

// Registro y Verificación
router.post("/register", authLimiter, validateRegister, register);
router.post("/verify", authLimiter, validateVerifyEmail, verifyEmail);
router.post("/google", googleLogin);

// Login
router.post("/login", authLimiter, validateLogin, login);

// Recuperación de Contraseña
router.post("/forgot-password", authLimiter, validateForgotPassword, forgotPassword);
router.post("/reset-password/:token", authLimiter, validateResetPassword, resetPassword);

// --- RUTAS PRIVADAS ---
router.post("/logout", verifyAuth, logout);
router.get("/profile", verifyAuth, getUserProfile);
router.get("/me", verifyAuth, getUserProfile);

module.exports = router;