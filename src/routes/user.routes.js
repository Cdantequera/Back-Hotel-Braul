const express = require("express");
const router = express.Router();
const { 
    updateUser,
    getUserById,
    toggleUserStatus,
    deleteUser,
    getAllUsers
} = require("../controllers/user.controller");

const { verifyAuth, verifyAdmin } = require("../middlewares/auth");
const { validateMongoID, validateUpdateRole } = require("../middlewares/validator");

// Todas las rutas requieren autenticación y ser ADMIN
router.use(verifyAuth, verifyAdmin); 

// --- Rutas de Administración ---

// Obtener todos
router.get("/", getAllUsers);

// Obtener uno por ID
router.get("/:id", validateMongoID, getUserById);

// Cambiar Rol
router.put("/:id/role", validateMongoID, validateUpdateRole, updateUser);

// Suspender / Activar usuario (Requisito Hotel)
router.patch("/:id/status", validateMongoID, toggleUserStatus);

// Eliminar usuario
router.delete("/:id", validateMongoID, deleteUser);

module.exports = router;