const express = require("express");
const router = express.Router();
const {
  createBooking,
  getAllBookings,
  deleteBooking
} = require("../controllers/bookings.controller");

// Obtener todas
//URL final: http://localhost:4000/api/v1/bookings
router.get("/", getAllBookings);

// Crear reserva
//URL final: http://localhost:4000/api/v1/bookings
router.post("/", createBooking);

// Eliminar reserva (Cancelar)
//URL final: http://localhost:4000/api/v1/bookings/:id
router.delete("/:id", deleteBooking);

module.exports = router;