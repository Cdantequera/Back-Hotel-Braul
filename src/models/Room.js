const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    number: { type: Number, required: true, unique: true },
    type: { type: String, required: true, enum: ["Simple", "Doble", "Suite", "Familiar"] },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, required: true, minLength: 10, maxLength: 500 },
    image: { type: String, required: true },
    
    // --- NUEVO CAMPO ---
    isFeatured: {
        type: Boolean,
        default: false // Por defecto no es destacada
    },

    available: { type: Boolean, default: true }
}, {
    timestamps: true
});

module.exports = mongoose.model("Room", roomSchema);