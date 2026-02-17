const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto"); 

const userSchema = new mongoose.Schema({
    // --- Definición de campos para el Hotel ---
    name: {
        type: String,
        required: true,
        trim: true
    },
    surname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["user", "admin", "superadmin"],
        default: "user"
    },
    active: {
        type: Boolean,
        default: true
    },
    verifiedEmail: {
        type: Boolean,
        default: false
    },
    verificationCode: {
        type: String,
        default: null
    },
    codeExpiration: {
        type: Date,
        default: null
    },
    // Campos para recuperación de contraseña
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    }
}, { 
    timestamps: true 
});

// --- Middlewares y Métodos ---

// Hash de la contraseña antes de guardar
userSchema.pre("save", async function(next){
    // Solo hasheamos si la contraseña ha sido modificada (o es nueva)
    if(!this.isModified("password")){
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
}); 

// Método para comparar contraseñas (Login)
userSchema.methods.comparePassword = async function(userPassword){
    return await bcrypt.compare(userPassword, this.password);
}

// Método para generar código de verificación (Registro/Activación)
userSchema.methods.generateVerificationCode = function(){
    // Generamos un código numérico de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.verificationCode = code;
    this.codeExpiration = Date.now() + 15 * 60 * 1000; // 15 minutos
    return code;
}

//  Método para generar token de recuperación de contraseña
userSchema.methods.createPasswordResetToken = function() {
    // 1. Generamos un token aleatorio seguro
    const resetToken = crypto.randomBytes(32).toString('hex');

    // 2. Guardamos el token en el usuario
    this.resetPasswordToken = resetToken;

    // 3. Establecemos expiración en 1 hora 
    this.resetPasswordExpires = Date.now() + 3600000; 

    // 4. Devolvemos el token (sin encriptar) para enviarlo por email
    return resetToken;
};

module.exports = mongoose.model("User", userSchema);