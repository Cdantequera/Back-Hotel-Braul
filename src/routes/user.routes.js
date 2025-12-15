const express = require("express");
const router = express.Router();

// --- IMPORTACIONES DE CONTROLADORES ---
const { 
    getAllUsers, 
    getUserById, 
    deleteUser, 
    changeUserRole 
} = require("../controllers/user.controller");

// --- IMPORTACIONES DE MIDDLEWARES (Validadores) ---
const { 
    validateUserId, 
    validateUpdateRole 
} = require("../middlewares/auth.validator");

// --- IMPORTACIÓN DE SEGURIDAD (JWT) ---
// Este es el guardia que revisa si tienes el token
const { authRequired } = require("../middlewares/validateToken");


// ==========================================
// RUTAS DE USUARIOS
// Base URL: http://localhost:4000/api/users
// ==========================================

// 1. Leer todos los usuarios (Requiere Token)
// URL Final: http://localhost:4000/api/v1/users
router.get("/", authRequired, getAllUsers);

// 2. Leer un usuario por ID (Requiere Token + ID válido)
// URL Final: http://localhost:4000/api/v1/users/:id
router.get("/:id", authRequired, validateUserId, getUserById);

// 3. Eliminar un usuario por ID (Requiere Token + ID válido)
// URL Final: http://localhost:4000/api/v1/users/:id
router.delete("/:id", authRequired, validateUserId, deleteUser);

// 4. Cambiar el ROL de un usuario (Requiere Token + ID válido + Rol válido)
// URL Final: http://localhost:4000/api/v1/users/:id/role
// Se usa PATCH porque solo actualizamos una parte del usuario (el rol)
router.patch("/:id/role", authRequired, validateUserId, validateUpdateRole, changeUserRole);


module.exports = router;