const Room = require("../models/Room");
const Booking = require("../models/Booking");
const cloudinary = require("../config/cloudinary");
// Ya no necesitamos fileCleanup porque Cloudinary maneja la eliminación

// --- CREAR ---
const createRoom = async (req, res, next) => {
    try {
        const { number, type, price, description, isFeatured } = req.body;

        const roomExists = await Room.findOne({ number });
        if (roomExists) {
            // Si ya existe y se subió archivo, eliminarlo de Cloudinary
            if (req.file && req.file.public_id) {
                await cloudinary.uploader.destroy(req.file.public_id);
            }
            return res.status(400).json({ ok: false, message: `La habitación ${number} ya existe.` });
        }

        // La URL completa de Cloudinary viene en req.file.path
        const newRoom = new Room({
            number,
            type,
            price,
            description,
            image: req.file ? req.file.path : null,
            isFeatured: isFeatured === 'true' || isFeatured === true
        });

        await newRoom.save();
        return res.status(201).json({ ok: true, message: "Creada con éxito", data: newRoom });
    } catch (error) {
        // Si ocurre un error después de subir la imagen, eliminarla
        if (req.file && req.file.public_id) {
            await cloudinary.uploader.destroy(req.file.public_id);
        }
        next(error);
    }
};

// --- OBTENER TODAS O FILTRAR POR FECHA (SIN CAMBIOS) ---
const getRooms = async (req, res, next) => {
    try {
        const { checkIn, checkOut } = req.query;

        if (checkIn && checkOut) {
            const start = new Date(checkIn);
            const end = new Date(checkOut);

            const overlappingBookings = await Booking.find({
                status: { $ne: 'cancelled' },
                $or: [
                    { checkIn: { $lt: end }, checkOut: { $gt: start } }
                ]
            }).select('room');

            const bookedRoomIds = overlappingBookings.map(b => b.room);

            const availableRooms = await Room.find({
                _id: { $nin: bookedRoomIds }
            });

            return res.status(200).json({ ok: true, data: availableRooms });
        }

        const rooms = await Room.find();
        return res.status(200).json({ ok: true, data: rooms });
    } catch (error) {
        next(error);
    }
};

// --- OBTENER POR ID (SIN CAMBIOS) ---
const getRoomById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const room = await Room.findById(id);
        if (!room) return res.status(404).json({ ok: false, message: "No encontrada" });
        return res.status(200).json({ ok: true, data: room });
    } catch (error) {
        next(error);
    }
};

// --- ACTUALIZAR ---
const updateRoom = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        const room = await Room.findById(id);
        if (!room) {
            // Si se subió archivo y la habitación no existe, eliminarlo
            if (req.file && req.file.public_id) {
                await cloudinary.uploader.destroy(req.file.public_id);
            }
            return res.status(404).json({ ok: false, message: "No encontrada" });
        }

        // Si se sube una nueva imagen, eliminar la anterior de Cloudinary
        if (req.file) {
            if (room.image) {
                // Extraer public_id de la URL antigua
                const publicId = extractPublicIdFromUrl(room.image);
                if (publicId) {
                    await cloudinary.uploader.destroy(publicId);
                }
            }
            updateData.image = req.file.path; // Nueva URL de Cloudinary
        }

        const updatedRoom = await Room.findByIdAndUpdate(id, updateData, { new: true });
        return res.status(200).json({ ok: true, message: "Actualizada", data: updatedRoom });
    } catch (error) {
        next(error);
    }
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

        // Verificamos si la habitación tiene reservas activas (pendientes o confirmadas)
        const activeBooking = await Booking.findOne({
            room: id,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (activeBooking) {
            return res.status(400).json({
                ok: false,
                message: "No se puede eliminar porque hay clientes con reservas activas o pendientes para esta habitación."
            });
        }

        // Eliminar imagen de Cloudinary si existe
        if (room.image) {
            const publicId = extractPublicIdFromUrl(room.image);
            if (publicId) {
                await cloudinary.uploader.destroy(publicId);
            }
        }

        await Room.findByIdAndDelete(id);
        return res.status(200).json({ ok: true, message: "Eliminada correctamente" });

    } catch (error) {
        next(error);
    }
};

// Función auxiliar para extraer public_id de una URL de Cloudinary
function extractPublicIdFromUrl(url) {
    try {
        // Ejemplo: https://res.cloudinary.com/demo/image/upload/v1234567890/hotel-braul/rooms/foto.jpg
        const regex = /\/upload\/(?:v\d+\/)?(.+?)\.\w+$/;
        const match = url.match(regex);
        return match ? match[1] : null;
    } catch (e) {
        return null;
    }
}

module.exports = {
    createRoom,
    getRooms,
    getRoomById,
    updateRoom,
    deleteRoom
};