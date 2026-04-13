const ContactMessage = require('../models/ContactMessage');

// --- CREAR MENSAJE (Público) ---
const createMessage = async (req, res, next) => {
    try {
        const { name, lastName, email, message } = req.body;

        if (!name || !lastName || !email || !message) {
            return res.status(400).json({ ok: false, message: "Todos los campos son obligatorios" });
        }

        const newMessage = new ContactMessage({
            name,
            lastName,
            email,
            message
        });

        await newMessage.save();

        return res.status(201).json({ ok: true, message: "Mensaje enviado exitosamente" });
    } catch (error) {
        next(error);
    }
};

// --- OBTENER TODOS LOS MENSAJES (Solo Admin) ---
const getMessages = async (req, res, next) => {
    try {
        // Ordenamos por fecha de creación, los más nuevos primero
        const messages = await ContactMessage.find().sort({ createdAt: -1 });
        return res.status(200).json({ ok: true, messages });
    } catch (error) {
        next(error);
    }
};

// --- MARCAR COMO LEÍDO (Solo Admin) ---
const markAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const message = await ContactMessage.findById(id);
        if (!message) {
            return res.status(404).json({ ok: false, message: "Mensaje no encontrado" });
        }

        message.isRead = true;
        await message.save();

        return res.status(200).json({ ok: true, message: "Mensaje marcado como leído", data: message });
    } catch (error) {
        next(error);
    }
};

// --- ELIMINAR MENSAJE (Solo Admin, opcional por si quieren borrar spam) ---
const deleteMessage = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const message = await ContactMessage.findByIdAndDelete(id);
        if (!message) {
            return res.status(404).json({ ok: false, message: "Mensaje no encontrado" });
        }

        return res.status(200).json({ ok: true, message: "Mensaje eliminado exitosamente" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createMessage,
    getMessages,
    markAsRead,
    deleteMessage
};
