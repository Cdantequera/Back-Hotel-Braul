const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

// --- IMPORTACIONES ---
const connectDB = require("./config/database");
const createSuperAdmin = require("./utils/createSuperAdmin");
const errorHandler = require("./middlewares/errorHandler");
const allowedOrigins = [
  'https://hotel-braul.vercel.app',
  'http://localhost:5173',      // Vite por defecto
  'http://localhost:3000'       // Por si usas otro puerto
];

// Rutas
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const roomRoutes = require("./routes/room.routes");
const bookingRoutes = require("./routes/booking.routes");
const paymentRoutes = require("./routes/payment.routes");
const configRoutes = require("./routes/config.routes");
const contactRoutes = require("./routes/contact.routes");

const app = express();

// --- CONFIGURACIÓN DE PROXY PARA RENDER ---
app.set('trust proxy', 1);

// --- CONEXIÓN A BASE DE DATOS ---
connectDB();

// Crear super admin al iniciar 
createSuperAdmin();

// --- MIDDLEWARES GLOBALES ---
app.use(morgan("dev"));

// ¡CORS DINÁMICO REPARADO PARA VERCEL!
app.use(cors({
  origin: function (origin, callback) {
    // Permitir solicitudes sin origen (como Postman o apps móviles)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado por CORS'));
    }
  },
  credentials: true
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- CARPETA ESTÁTICA ---
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// --- RUTAS (ENDPOINTS) ---
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/rooms", roomRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/config", configRoutes);
app.use("/api/v1/contact", contactRoutes);

// --- MANEJO DE ERRORES ---
app.use(errorHandler);

// --- ARRANQUE DEL SERVIDOR ---
const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`🏨 Servidor Hotel corriendo en el puerto ${port}`);
});