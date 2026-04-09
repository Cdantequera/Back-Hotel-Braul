require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('./src/config/cloudinary');
const Room = require('./src/models/Room');
const fs = require('fs');
const path = require('path');

const MONGO_URI = process.env.MONGO_URI;

async function migrate() {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    const rooms = await Room.find({ image: { $regex: /^[^h]/ } }); // que no empiece con http
    console.log(`📸 ${rooms.length} habitaciones con imagen local`);

    for (let room of rooms) {
        const localPath = path.join(__dirname, 'uploads', 'rooms', room.image);
        if (fs.existsSync(localPath)) {
            try {
                const result = await cloudinary.uploader.upload(localPath, {
                    folder: 'hotel-braul/rooms'
                });
                room.image = result.secure_url;
                await room.save();
                console.log(`⬆️ ${room.number} migrada: ${result.secure_url}`);
                // Opcional: borrar archivo local
                fs.unlinkSync(localPath);
            } catch (err) {
                console.error(`❌ Error con ${room.number}:`, err.message);
            }
        } else {
            console.log(`⚠️ Archivo no encontrado: ${localPath}`);
        }
    }

    console.log('🏁 Migración finalizada');
    mongoose.disconnect();
}

migrate();