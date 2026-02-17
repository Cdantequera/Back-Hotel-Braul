const express = require("express");
const router = express.Router();
const { 
    createRoom, 
    getRooms, 
    getRoomById, 
    updateRoom, 
    deleteRoom 
} = require("../controllers/room.controller");

// Middlewares
const { verifyAuth, verifyAdmin } = require("../middlewares/auth");
const { uploadRoom } = require("../config/multer");
const { validateRoom, validateMongoID } = require("../middlewares/validator");

// --- RUTAS PÚBLICAS ---
// Cualquiera puede ver el catálogo de habitaciones
router.get("/", getRooms);
router.get("/:id", validateMongoID, getRoomById);

// --- RUTAS PRIVADAS (Solo Admin) ---
// Crear habitación: Requiere Auth + Admin + Foto + Validación
router.post("/", 
    verifyAuth, 
    verifyAdmin, 
    uploadRoom, 
    validateRoom, 
    createRoom
);

// Actualizar habitación
router.put("/:id", 
    verifyAuth, 
    verifyAdmin, 
    validateMongoID,
    validateRoom,
    uploadRoom,
    updateRoom
);

// Eliminar habitación
router.delete("/:id", 
    verifyAuth, 
    verifyAdmin, 
    validateMongoID, 
    deleteRoom
);

module.exports = router;