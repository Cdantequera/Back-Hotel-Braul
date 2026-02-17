const express = require("express");
const router = express.Router();

// 1. Importar Controlador
const { 
    createBooking, 
    getAllBookings, 
    getUserBookings, 
    cancelBooking, 
    reactivateBooking
} = require("../controllers/booking.controller");

// 2. Importar Middlewares de Seguridad y Validación
const { verifyAuth, verifyAdmin } = require("../middlewares/auth");
const { validateBooking, validateMongoID } = require("../middlewares/validator");

// --- RUTAS DE RESERVAS ---

// Todas las rutas de reservas requieren que el usuario esté logueado
router.use(verifyAuth); 

// A. Rutas publicas
// Crear una nueva reserva (Validamos datos de fechas y habitación)
router.post("/", validateBooking, createBooking);

// Ver MIS propias reservas
router.get("/my-bookings", getUserBookings);

// Cancelar una reserva (Usamos PATCH porque actualizamos el estado a 'cancelled', no borramos el registro)
router.patch("/:id/cancel", validateMongoID, cancelBooking);

// Reactivar reserva cancelada
router.patch("/:id/reactivate", validateMongoID, reactivateBooking);


// B. Rutas de Administración (Solo Admin)
// Ver TODAS las reservas del sistema (útil para el dashboard del recepcionista)
router.get("/", verifyAdmin, getAllBookings);

module.exports = router;