const express = require("express");
const router = express.Router();

// 1. Importamos el Controlador 
const { register, login } = require("../controllers/auth.controller");

// 2. Importamos los Validadores 
const { validateRegister, validateLogin } = require("../middlewares/auth.validator");

// Ruta para Registrarse:
// Primero valida (validateRegister) -> Si pasa, ejecuta el registro (register)
router.post("/register", validateRegister, register);

// Ruta para Login:
// Primero valida (validateLogin) -> Si pasa, ejecuta el login (login)
router.post("/login", validateLogin, login);

module.exports = router;