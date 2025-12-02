const express = require("express");
require("dotenv").config();
const morgan = require("morgan");
const cors = require("cors");

// --- IMPORTAMOS LAS RUTAS 
const authRoutes = require("./routes/auth.routes");
const roomRoutes = require("./routes/rooms.routes");
const userRoutes = require("./routes/user.routes");
const bookingRoutes = require("./routes/bookings.routes");

const app = express();

// MIDDLEWARES
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

// --- ENDPOINTS / RUTAS 
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/rooms", roomRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/users", userRoutes);

// PUERTO
const port = process.env.PORT || 4000; 

app.listen(port, () => {
    console.log(`Servidor del Hotel corriendo en http://localhost:${port}`);
});