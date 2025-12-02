const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Ruta al archivo JSON 
const filePath = path.resolve(__dirname, "../data/user.json");

// Función auxiliar para LEER datos
function readData() {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    // Si no existe, retornamos array vacío
    console.log("No se pudo leer el archivo o está vacío, iniciando array nuevo.");
    return [];
  }
}

// Función auxiliar para ESCRIBIR datos
function writeData(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// --- REGISTER ---
const register = (req, res) => {
    try {
        const { email, password, role } = req.body;

    if (!email || !password) {
        return res.status(400).json({ 
        ok: false,
        msj: "Email y contraseña obligatorios" });
    }

    const users = readData();
    // Verificamos si ya existe
    const userExists = users.find((user) => user.email === email);

    if (userExists) {
        return res.status(409).json({ 
            ok: false, 
            msj: "El usuario ya existe" });
    }

    // Creamos usuario nuevo
    const newUser = {
        id: crypto.randomUUID(),
        email,
        password,
    };

    users.push(newUser);
    writeData(users);

    return res.status(201).json({
        ok: true,
        msj: "Registro exitoso",
        user: { 
            id: newUser.id, 
            email: newUser.email,
            role: newUser.role }
    });

    } catch (error) {
    console.log(error);
    return res.status(500).json({ 
        ok: false,
        msj: "Error en el servidor" });
    }
};

// --- LOGIN ---
const login = (req, res) => {

    try {
        const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ 
            ok: false,
            msj: "Email y contraseñas son obligatorios" });
    }
    //Leemos los usuarios
    const users = readData();
    //Buscamos el usuario
    const user = users.find(
        (u) => u.email === email && u.password === password
    );

    if (!user) {
        return res.status(401).json({ 
        ok: false,
        msj: "Email o contraseña incorrectos" });
    }

    return res.status(200).json({
        ok: true,
        msj: "Login correcto",
        user: {
            id: user.id,
            email: user.email,
            
        }
    });

    } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ 
        ok: false,
        msj: "Error en el servidor, intente de nuevo" });
    }
};

module.exports = { register, login };