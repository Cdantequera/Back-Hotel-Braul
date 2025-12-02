const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/auth.controller");

// Definimos las rutas
//URL final: http://localhost:4000/api/auth/register
router.post("/register", register);

//URL final: http://localhost:4000/api/auth/login
router.post("/login", login);

module.exports = router;