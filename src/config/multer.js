const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

// Configurar almacenamiento en Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'hotel-braul/rooms',        // Carpeta organizada en Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 800, crop: 'limit' }] // Redimensiona automáticamente
  }
});

// Filtro de archivos (solo imágenes)
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|webp/;
  const mimetype = fileTypes.test(file.mimetype);
  const extname = fileTypes.test(file.originalname.split('.').pop().toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("Solo se permiten imágenes (jpeg, jpg, png, webp)"));
};

// Configuración final de Multer con Cloudinary
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});

// Middleware específico para habitaciones
const uploadRoom = upload.single("image");

module.exports = { uploadRoom };