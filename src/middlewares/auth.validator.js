const { body, param, validationResult } = require("express-validator");
const User = require("../models/User");

// Middleware para manejar los errores de validación
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            ok: false,
            message: "Error de validación",
            errors: errors.mapped()
        });
    }
    next();
};

// Validaciones para el REGISTRO
const validateRegister = [
    body("name")
        .isLength({ min: 3 }).withMessage("El nombre debe tener al menos 3 caracteres")
        .notEmpty().withMessage("El nombre es obligatorio")
        .isString().withMessage("El nombre debe ser texto")
        .trim(),

    body("email")
        .isEmail().withMessage("El email debe ser válido")
        .notEmpty().withMessage("El email es obligatorio")
        .normalizeEmail()
        .custom(async (email) => {
            const user = await User.findOne({ email });
            if (user) {
                throw new Error("El email ya está registrado");
            }
        }),

    body("password")
        .isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres")
        .notEmpty().withMessage("La contraseña es obligatoria"),
    
    handleValidationErrors
];

// Validaciones para el LOGIN
const validateLogin = [
    body("email")
        .isEmail().withMessage("El email debe ser válido")
        .notEmpty().withMessage("El email es obligatorio")
        .normalizeEmail(),
    
    body("password")
        .isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres")
        .notEmpty().withMessage("La contraseña es obligatoria"),
    
    handleValidationErrors
];

// Validar ID de usuario (para borrar o actualizar)
const validateUserId = [
    param("id")
        .isMongoId().withMessage("El ID proporcionado no es válido")
        .custom(async (id) => {
            const user = await User.findById(id);
            if (!user) {
                throw new Error("El usuario no existe");
            }
        }),
    handleValidationErrors
];

// Validar actualización de ROL (Adaptado al Hotel)
const validateUpdateRole = [
    param("id")
        .isMongoId().withMessage("El ID proporcionado no es válido"),

    body("role")
        .notEmpty().withMessage("El rol es obligatorio")
        // AQUI ESTA EL CAMBIO IMPORTANTE:
        .isIn(["huesped", "admin", "recepcionista"])
        .withMessage("El rol debe ser: huesped, admin o recepcionista"),

    handleValidationErrors
];

module.exports = {
    validateRegister,
    validateLogin,
    validateUserId,
    validateUpdateRole
};