const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authRequired = async (req, res, next) => {
  // 1. Buscamos el token en los headers
  // El cliente suele mandarlo así: "Bearer eyJhbGciOi..."
  const authHeader = req.headers["authorization"]; 

  if (!authHeader) {
    return res.status(401).json({
      ok: false,
      message: "Acceso denegado. No hay token."
    });
  }

  // Limpiamos el token (quitamos la palabra "Bearer " si viene)
  const token = authHeader.split(" ")[1] || authHeader;

  try {
    // 2. Verificamos si el token es válido usando la clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Guardamos los datos del usuario dentro de la petición (req)
    // Así las siguientes funciones sabrán quién es el usuario
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
    }

    next(); // ¡Pase usted!
  } catch (error) {
    return res.status(403).json({
      ok: false,
      message: "Token inválido o expirado."
    });
  }
};

module.exports = { authRequired };