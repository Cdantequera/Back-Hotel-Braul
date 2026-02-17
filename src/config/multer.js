const multer = require("multer");
const path = require("path");

// Configuración del almacenamiento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Define la carpeta destino: uploads/rooms
        cb(null, path.join(__dirname, "../../uploads/rooms"));
    },
    filename: function (req, file, cb) {
        // Genera un nombre único: timestamp + extensión
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, "room-" + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtro de archivos (Solo imágenes)
const fileFilter = (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|webp/;
    const mimetype = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error("Solo se permiten imágenes (jpeg, jpg, png, webp)"));
};

// Configuración final de Multer
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB
    fileFilter: fileFilter
});

// Exportamos el middleware específico para habitaciones
// 'imagen' es el nombre del campo que debe enviar el Frontend (FormData)
const uploadRoom = upload.single("image");

module.exports = { uploadRoom };