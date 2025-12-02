const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Rutas a LOS DOS archivos
const bookingsPath = path.resolve(__dirname, "../data/bookings.json");
const roomsPath = path.resolve(__dirname, "../data/rooms.json");


const readJson = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    return [];
  }
};

const writeJson = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// --- CREAR RESERVA ---
const createBooking = (req, res) => {
  try {
    const { userId, roomId, checkIn, checkOut } = req.body;

    if (!userId || !roomId || !checkIn || !checkOut) {
      return res.status(400).json({ ok: false, msj: "Faltan datos obligatorios" });
    }

    // 1. Leemos las habitaciones para ver si la que quieren está libre
    const rooms = readJson(roomsPath);
    const roomIndex = rooms.findIndex(r => r.id === roomId);

    if (roomIndex === -1) {
      return res.status(404).json({ ok: false, msj: "Habitación no encontrada" });
    }

    const room = rooms[roomIndex];

    if (!room.available) {
      return res.status(409).json({ ok: false, msj: "La habitación ya está ocupada" });
    }

    // 2. Calculamos el precio total
    // Convertimos las fechas a objetos Date para restar
    const date1 = new Date(checkIn);
    const date2 = new Date(checkOut);
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Milisegundos a días

    const totalPrice = room.price * diffDays;

    // 3. Creamos la reserva
    const bookings = readJson(bookingsPath);
    const newBooking = {
      id: crypto.randomUUID(),
      userId,
      roomId,
      checkIn,
      checkOut,
      totalPrice,
      status: "confirmed"
    };

    bookings.push(newBooking);
    writeJson(bookingsPath, bookings); // Guardamos reserva

    // 4. ¡MAGIA! Marcamos la habitación como ocupada
    rooms[roomIndex].available = false;
    writeJson(roomsPath, rooms); // Actualizamos rooms.json

    return res.status(201).json({
      ok: true,
      msj: `Reserva creada por ${diffDays} noches. Total: $${totalPrice}`,
      booking: newBooking
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, msj: "Error al crear reserva" });
  }
};

// --- LEER RESERVAS ---
const getAllBookings = (req, res) => {
  try {
    const bookings = readJson(bookingsPath);
    return res.status(200).json({ ok: true, data: bookings });
  } catch (error) {
    return res.status(500).json({ ok: false, msj: "Error al leer reservas" });
  }
};

// --- ELIMINAR RESERVA (Check-out o Cancelación) ---
const deleteBooking = (req, res) => {
  try {
    const { id } = req.params;
    const bookings = readJson(bookingsPath);
    
    // Buscamos la reserva para saber qué habitación liberar
    const bookingToDelete = bookings.find(b => b.id === id);

    if (!bookingToDelete) {
      return res.status(404).json({ ok: false, msj: "Reserva no encontrada" });
    }

    // 1. Borramos la reserva
    const newBookings = bookings.filter(b => b.id !== id);
    writeJson(bookingsPath, newBookings);

    // 2. Liberamos la habitación (volvemos a poner available: true)
    const rooms = readJson(roomsPath);
    const roomIndex = rooms.findIndex(r => r.id === bookingToDelete.roomId);
    
    if (roomIndex !== -1) {
      rooms[roomIndex].available = true;
      writeJson(roomsPath, rooms);
    }

    return res.status(200).json({ ok: true, msj: "Reserva eliminada y habitación liberada" });

  } catch (error) {
    return res.status(500).json({ ok: false, msj: "Error al eliminar reserva" });
  }
};

module.exports = { createBooking, getAllBookings, deleteBooking };