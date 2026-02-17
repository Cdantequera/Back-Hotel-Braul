const { body, param, validationResult } = require("express-validator");
const User = require("../models/User");
const Room = require("../models/Room");
// Asegúrate de que esta ruta sea correcta según donde creaste el archivo
const { deleteOneFile, cleanUploadsFiles } = require("../utils/fileCleanup");

// --- MIDDLEWARES DE MANEJO DE ERRORES ---

const handleValidationsErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      message: "Errores de validación",
      errors: errors.mapped(),
    });
  }
  next();
};

const handleValidationsErrorsWithFiles = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) deleteOneFile(req.file.path);
    if (req.files) cleanUploadsFiles(req);

    return res.status(400).json({
      ok: false,
      message: "Errores de validación e imágenes eliminadas",
      errors: errors.mapped(),
    });
  }
  next();
};

// --- VALIDACIONES DE USUARIO (Auth) ---

const validateRegister = [
  body("name").notEmpty().withMessage("El nombre es requerido").trim().isLength({ min: 2 }),
  body("surname").notEmpty().withMessage("El apellido es requerido").trim(),
  body("email")
    .notEmpty().withMessage("El email es requerido")
    .isEmail().withMessage("Formato de email inválido")
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (user) throw new Error("El usuario ya existe");
    }),
  body("password").isLength({ min: 6 }).withMessage("Mínimo 6 caracteres"),
  
  handleValidationsErrors // No esperamos archivos en registro simple
];

const validateLogin = [
  body("email").isEmail().withMessage("Email inválido"),
  body("password").notEmpty().withMessage("La contraseña es requerida"),
  handleValidationsErrors
];

const validateVerifyEmail = [
    body('email').isEmail(),
    body('code').isLength({min:6, max:6}).isNumeric(),
    handleValidationsErrors
];

// --- [AQUÍ ESTABA EL ERROR PROBABLEMENTE] ---
// Validaciones para recuperar contraseña
const validateForgotPassword = [
    body('email').isEmail().withMessage('Ingresa un email válido'),
    handleValidationsErrors
];

const validateResetPassword = [
    body('password').isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres'),
    handleValidationsErrors
];

const validateUpdateRole = [
    body('role')
        .notEmpty().withMessage('El rol es requerido')
        .isIn(['user', 'admin']).withMessage('Rol no válido (solo user o admin)'),
    handleValidationsErrors
];


// --- VALIDACIONES COMUNES ---

const validateMongoID = [
  param('id').isMongoId().withMessage('ID inválido'),
  handleValidationsErrors
];

// --- VALIDACIONES DE HABITACIONES ---

const validateRoom = [
  body('number').notEmpty(),
  body('type').isIn(['Simple', 'Doble', 'Suite', 'Familiar']),
  body('price').isFloat({ min: 0 }),
  body('description').notEmpty(),
  handleValidationsErrorsWithFiles
];

// --- VALIDACIONES DE RESERVAS ---
const validateBooking = [
    body('room').isMongoId(),
    body('checkIn').isISO8601(),
    body('checkOut').isISO8601(),
    handleValidationsErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateVerifyEmail,
  validateForgotPassword, 
  validateResetPassword,  
  validateMongoID,
  validateRoom,
  validateUpdateRole,
  validateBooking
};