const Room = require("../models/Room");
// IMPORTANTE: Importamos Booking para poder buscar las reservas
const Booking = require("../models/Booking"); 
const { deleteOneFile } = require("../utils/fileCleanup");
const path = require('path');

// --- CREAR ---
const createRoom = async (req, res, next) => {
    try {
        const { number, type, price, description, isFeatured } = req.body; 

        const roomExists = await Room.findOne({ number });
        if (roomExists) {
            if (req.file) deleteOneFile(req.file.path);
            return res.status(400).json({ ok: false, message: `La habitación ${number} ya existe.` });
        }

        const newRoom = new Room({
            number, type, price, description,
            image: req.file ? req.file.filename : null,
            isFeatured: isFeatured === 'true' || isFeatured === true 
        });

        await newRoom.save();
        return res.status(201).json({ ok: true, message: "Creada con éxito", data: newRoom });
    } catch (error) { next(error); }
};

// --- OBTENER TODAS O FILTRAR POR FECHA ---
const getRooms = async (req, res, next) => {
    try {
        const { checkIn, checkOut } = req.query;

        // Si el frontend nos envía fechas, hacemos el filtro
        if (checkIn && checkOut) {
            const start = new Date(checkIn);
            const end = new Date(checkOut);

            // 1. Buscamos todas las reservas activas que se crucen con estas fechas
            const overlappingBookings = await Booking.find({
                status: { $ne: 'cancelled' },
                $or: [
                    { checkIn: { $lt: end }, checkOut: { $gt: start } }
                ]
            }).select('room');

            // 2. Extraemos solo los IDs de las habitaciones que están ocupadas
            const bookedRoomIds = overlappingBookings.map(b => b.room);

            // 3. Buscamos las habitaciones cuyo ID NO ($nin) esté en la lista de ocupadas
            const availableRooms = await Room.find({
                _id: { $nin: bookedRoomIds }
            });

            return res.status(200).json({ ok: true, data: availableRooms });
        }

        // Si no hay fechas (navegación normal), devolvemos todas las habitaciones
        const rooms = await Room.find();
        return res.status(200).json({ ok: true, data: rooms });
    } catch (error) { next(error); }
};

// --- OBTENER POR ID ---
const getRoomById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const room = await Room.findById(id);
        if (!room) return res.status(404).json({ ok: false, message: "No encontrada" });
        return res.status(200).json({ ok: true, data: room });
    } catch (error) { next(error); }
};

// --- ACTUALIZAR ---
const updateRoom = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        const room = await Room.findById(id);
        if (!room) return res.status(404).json({ ok: false, message: "No encontrada" });

        if (req.file) {
            if (room.image) deleteOneFile(path.join(__dirname, "../../uploads/rooms", room.image));
            updateData.image = req.file.filename;
        }

        const updatedRoom = await Room.findByIdAndUpdate(id, updateData, { new: true });
        return res.status(200).json({ ok: true, message: "Actualizada", data: updatedRoom });
    } catch (error) { next(error); }
};

// --- ELIMINAR ---
const deleteRoom = async (req, res, next) => {
    try {
        const { id } = req.params;

        const totalRooms = await Room.countDocuments();

        if (totalRooms <= 3) {
            return res.status(400).json({ 
                ok: false, 
                message: "No puedes eliminar más habitaciones. El hotel debe tener al menos 3 visibles." 
            });
        }

        const room = await Room.findById(id);
        if (!room) return res.status(404).json({ ok: false, message: "No encontrada" });

        if (room.image) deleteOneFile(path.join(__dirname, "../../uploads/rooms", room.image));
        
        await Room.findByIdAndDelete(id);
        return res.status(200).json({ ok: true, message: "Eliminada correctamente" });

    } catch (error) { next(error); }
};

module.exports = { createRoom, getRooms, getRoomById, updateRoom, deleteRoom };