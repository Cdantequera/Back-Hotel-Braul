const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true // Esto evita que dos personas se registren con el mismo correo
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["huesped", "admin", "recepcionista"], 
        default: "huesped"
    }
}, { 
    timestamps: true // Esto crea automáticamente campos de 'createdAt' y 'updatedAt'
});

module.exports = mongoose.model("User", userSchema);