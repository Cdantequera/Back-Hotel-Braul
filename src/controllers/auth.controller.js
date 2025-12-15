const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Registrar Usuario
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body; // Agregamos 'role' por si quieres crear admins

    // Validar si el usuario ya existe (aunque el validador ya lo hace, doble seguridad no daña)
    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({
        ok: false,
        message: "El email ya existe"
      });
    }

    // Crear el usuario
    const newUser = await User.create({
      name,
      email,
      password,
      role // Si no envías rol, el modelo pondrá "guest" por defecto
    });

    return res.status(201).json({
      ok: true,
      message: "Usuario creado exitosamente",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      message: "Error en el servidor",
      error: error.message
    });
  }
}

// Login de Usuario
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password }); // Recuerda: idealmente usar bcrypt

    if (!user) {
      return res.status(401).json({ ok: false, message: "Credenciales incorrectas" });
    }

    // --- NUEVO: GENERAR TOKEN ---
    const token = jwt.sign(
        { id: user._id, role: user.role }, // Payload (datos que guardamos en el token)
        process.env.JWT_SECRET,            // Clave secreta
        { expiresIn: "1d" }                // Expira en 1 día
    );

    return res.status(200).json({
      ok: true,
      message: "Login exitoso",
      token, // <--- ENVIAMOS EL TOKEN AL FRONTEND
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, message: error.message });
  }
}

module.exports = {
  register,
  login
};