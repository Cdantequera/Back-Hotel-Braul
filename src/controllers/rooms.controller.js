const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const filePath = path.resolve(__dirname, "../data/rooms.json");

const readData = () => {
    try {
        const data = fs.readFileSync(filePath, "utf8");
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const writeData = (data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// --- 1. OBTENER TODAS LAS HABITACIONES ---
const getAllRooms = (req, res) => {
    try {
    const rooms = readData();
    return res.status(200).json({
        ok: true,
        data: rooms,
    });
    } catch (error) {
    return res.status(500).json({ ok: false, msj: "Error al leer las habitaciones" });
    }
};

// --- 2. OBTENER HABITACIÓN POR ID ---
const getRoomById = (req, res) => {
    try {
    const { id } = req.params;
    const rooms = readData();
    const room = rooms.find((r) => r.id === id);

    if (!room) {
        return res.status(404).json({ ok: false, msj: "Habitación no encontrada" });
    }

    return res.status(200).json({ ok: true, data: room });
    } catch (error) {
    return res.status(500).json({ ok: false, msj: "Error del servidor" });
    }
};

/* ----------------------uso de admin---------------------- */
// --- 3. CREAR HABITACIÓN ---
const createRoom = (req, res) => {
    try {
    // Pedimos número, tipo (simple/doble) y precio
    const { number, type, price } = req.body;

    if (!number || !type || !price) {
        return res.status(400).json({ ok: false, msj: "Faltan datos (número, tipo o precio)" });
    }

    const rooms = readData();
    
    // Validamos que no exista otra habitación con el mismo número
    const exists = rooms.find(r => r.number === number);
    if (exists) {
        return res.status(409).json({ ok: false, msj: `La habitación ${number} ya existe` });
    }

    const newRoom = {
        id: crypto.randomUUID(),
        number,
        type,
        price: parseFloat(price), // Nos aseguramos que sea número
        available: true,          // Por defecto la creamos disponible
    };

    rooms.push(newRoom);
    writeData(rooms);

    return res.status(201).json({ ok: true, msj: "Habitación creada", room: newRoom });

    } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, msj: "Error al crear habitación" });
    }
};

// --- 4. ACTUALIZAR HABITACIÓN ---
const updateRoom = (req, res) => {
    try {
    const { id } = req.params;
    const rooms = readData();
    const roomIndex = rooms.findIndex((r) => r.id === id);

    if (roomIndex === -1) {
        return res.status(404).json({ ok: false, msj: "Habitación no encontrada" });
    }

    // Actualizamos manteniendo el ID original
    rooms[roomIndex] = {
        ...rooms[roomIndex],
        ...req.body,
        id: id 
    };

    writeData(rooms);
    return res.status(200).json({ ok: true, msj: "Habitación actualizada", room: rooms[roomIndex] });

    } catch (error) {
    return res.status(500).json({ ok: false, msj: "Error al actualizar" });
    }
};

// --- 5. ELIMINAR HABITACIÓN ---
const deleteRoom = (req, res) => {
    try {
    const { id } = req.params;
    const rooms = readData();
    
    const newRooms = rooms.filter((r) => r.id !== id);

    if (rooms.length === newRooms.length) {
        return res.status(404).json({ ok: false, msj: "Habitación no encontrada" });
    }

    writeData(newRooms);
    return res.status(200).json({ ok: true, msj: "Habitación eliminada" });

    } catch (error) {
    return res.status(500).json({ ok: false, msj: "Error al eliminar" });
    }
};

module.exports = {
    getAllRooms,
    getRoomById,
    createRoom,
    updateRoom,
    deleteRoom
};