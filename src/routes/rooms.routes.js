const express = require("express");
const router = express.Router();
const {
    getAllRooms,
    getRoomById,
    createRoom,
    updateRoom,
    deleteRoom,
} = require("../controllers/rooms.controller"); 

// Rutas Públicas 

//URL final: http://localhost:4000/api/v1/rooms
router.get("/", getAllRooms);
//URL final: http://localhost:4000/api/v1/rooms/:id
router.get("/:id", getRoomById);

// Rutas Privadas (Solo admin debería tocar esto)

//URL final: http://localhost:4000/api/v1/rooms
router.post("/", createRoom);
//URL final: http://localhost:4000/api/v1/rooms/:id
router.put("/:id", updateRoom);
//URL final: http://localhost:4000/api/v1/rooms/:id
router.delete("/:id", deleteRoom);

module.exports = router;