const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        // Conexión a la base de datos usando la variable de entorno del archivo .env
        await mongoose.connect(process.env.MONGO_URI, {
        });
        console.log("🌎 Conectado a MongoDB exitosamente");
    } catch (error) {
        console.error("✖️ Error al conectar a MongoDB:", error.message);
        // Detener la aplicación si falla la conexión
        process.exit(1);
    }
};

// Exportamos la función directamente (sin llaves) para evitar el error "is not a function"
module.exports = connectDB;