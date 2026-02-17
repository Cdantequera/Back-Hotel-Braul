const Booking = require('../models/Booking');
const Room = require('../models/Room');

// --- 1. Crear Reserva (con validación de fechas) ---
const createBooking = async (req, res, next) => {
    try {
        const { room, checkIn, checkOut } = req.body;

        const start = new Date(checkIn);
        const end = new Date(checkOut);

        // A. VALIDACIÓN DE DISPONIBILIDAD
        const existingBooking = await Booking.findOne({
            room: room, 
            status: { $ne: 'cancelled' }, 
            $or: [
                { checkIn: { $lt: end }, checkOut: { $gt: start } }
            ]
        });

        if (existingBooking) {
            return res.status(409).json({ 
                ok: false,
                message: "La habitación no está disponible en esas fechas. Ya existe una reserva."
            });
        }

        // B. CALCULAR PRECIO TOTAL
        const roomData = await Room.findById(room);
        if (!roomData) {
            return res.status(404).json({ message: "Habitación no encontrada" });
        }

        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        const totalDays = diffDays === 0 ? 1 : diffDays; 
        
        const totalPrice = totalDays * roomData.price;

        // C. CREAR LA RESERVA (Ajuste crítico en el ID de usuario)
        const newBooking = new Booking({
            user: req.user.id || req.user._id, // Previene error según cómo se firmó el token
            room,
            checkIn: start,
            checkOut: end,
            totalPrice,
            status: 'confirmed' 
        });

        await newBooking.save();

        res.status(201).json({
            ok: true,
            message: "Reserva creada con éxito",
            booking: newBooking
        });

    } catch (error) {
        next(error);
    }
};

// --- 2. Obtener Reservas del Usuario (Mis reservas) ---
const getUserBookings = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user._id;
        const bookings = await Booking.find({ user: userId })
            .populate('room', 'number type price image')
            .sort({ createdAt: -1 });

        res.status(200).json({ ok: true, bookings });
    } catch (error) {
        next(error);
    }
};

// --- 3. Obtener Todas las Reservas (Admin) ---
const getAllBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find()
            .populate('user', 'name email') 
            .populate('room', 'number type')
            .sort({ checkIn: 1 }); 

        res.status(200).json({ ok: true, bookings });
    } catch (error) {
        next(error);
    }
};

// --- 4. Cancelar Reserva ---
const cancelBooking = async (req, res, next) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({ message: "Reserva no encontrada" });
        }

        const userId = req.user.id || req.user._id;
        if (booking.user.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: "No tienes permiso para cancelar esta reserva" });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.status(200).json({ ok: true, message: "Reserva cancelada correctamente" });

    } catch (error) {
        next(error);
    }
};

// --- 5. Reactivar Reserva Cancelada ---
const reactivateBooking = async (req, res, next) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id);

        if (!booking) return res.status(404).json({ message: "Reserva no encontrada" });

        if (booking.status !== 'cancelled') {
            return res.status(400).json({ message: "La reserva no está cancelada" });
        }

        const existingBooking = await Booking.findOne({
            room: booking.room,
            status: { $ne: 'cancelled' },
            $or: [
                { checkIn: { $lt: booking.checkOut }, checkOut: { $gt: booking.checkIn } }
            ]
        });

        if (existingBooking) {
            return res.status(409).json({ 
                ok: false, 
                message: "No se puede reactivar: Las fechas ya han sido ocupadas por otra reserva." 
            });
        }

        booking.status = 'confirmed';
        await booking.save();

        res.status(200).json({ ok: true, message: "Reserva reactivada exitosamente" });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    createBooking,
    getUserBookings,
    getAllBookings,
    cancelBooking,
    reactivateBooking
};