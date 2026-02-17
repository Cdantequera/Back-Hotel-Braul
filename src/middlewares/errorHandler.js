const { cleanUploadsFiles } = require("../utils/fileCleanup");

const errorHandler = (err, req, res, next) => {
    console.error("Error:", err); // Log del error en consola del servidor
    
    // Limpiar archivos subidos si hubo error (importante para Rooms)
    cleanUploadsFiles(req);

    // Error de validación de Mongoose
    if(err.name === "ValidationError"){
        const errors = Object.values(err.errors).map(error => error.message);
        return res.status(400).json({
            ok: false,
            message: `Error de validación en BD`,
            errors
        });
    }

    // Errores de Multer
    if (err.message === "Unexpected field") {
         return res.status(400).json({ ok: false, message: "Campo de archivo no esperado" });
    }
    if (err.code === "LIMIT_FILE_SIZE"){
        return res.status(400).json({ ok: false, message: "El archivo es demasiado grande" });
    }

    // Error Genérico
    res.status(err.statusCode || 500).json({
        ok: false,
        message: err.message || "Error interno del servidor"
    });
};

module.exports = errorHandler;