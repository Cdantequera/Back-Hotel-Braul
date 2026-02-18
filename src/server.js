const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // Necesario para leer la cookie del token
const path = require("path");
require("dotenv").config();

// --- IMPORTACIONES ---
const connectDB = require("./config/database");
const createSuperAdmin = require("./utils/createSuperAdmin");
const errorHandler = require("./middlewares/errorHandler"); // Importamos el manejador de errores

// Rutas
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const roomRoutes = require("./routes/room.routes");
const bookingRoutes = require("./routes/booking.routes");
const paymentRoutes = require("./routes/payment.routes");

const app = express();

// --- CONEXIÓN A BASE DE DATOS ---
connectDB();

// Crear super admin al iniciar 
createSuperAdmin();

// --- MIDDLEWARES GLOBALES ---
app.use(morgan("dev"));
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Para parsear formularios si fuera necesario
app.use(cookieParser()); // Middleware para cookies

// --- CARPETA ESTÁTICA ---
// Esto servirá las fotos de las habitaciones (Rooms)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// --- RUTAS (ENDPOINTS) ---
app.use("/api/v1/auth", authRoutes);   
app.use("/api/v1/users", userRoutes); 
app.use("/api/v1/rooms", roomRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/payments", paymentRoutes);

// --- MANEJO DE ERRORES ---
// Debe ir AL FINAL de todas las rutas
app.use(errorHandler);

// --- ARRANQUE DEL SERVIDOR ---
const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`🏨 Servidor Hotel corriendo en http://localhost:${port}`);
});