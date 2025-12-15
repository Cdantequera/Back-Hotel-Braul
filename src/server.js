// src/server.js
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();

// --- IMPORTACIONES DE RUTAS ---
const connectDB = require("./config/database");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes"); // <--- Importamos rutas de usuario

const app = express();

// --- CONEXIÓN A BASE DE DATOS ---
connectDB();

// --- MIDDLEWARES ---
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

// --- RUTAS (ENDPOINTS) ---
// Aquí es donde definimos la "puerta de entrada"
// Agregamos "/v1" para que coincida con lo que buscas en Postman

app.use("/api/v1/auth", authRoutes);   // Quedará: http://localhost:4000/api/v1/auth/login
app.use("/api/v1/users", userRoutes);  // Quedará: http://localhost:4000/api/v1/users

// --- ARRANQUE DEL SERVIDOR ---
const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`🏨 Servidor corriendo en http://localhost:${port}`);
    console.log(`   - Auth:  http://localhost:${port}/api/v1/auth`);
    console.log(`   - Users: http://localhost:${port}/api/v1/users`);
});