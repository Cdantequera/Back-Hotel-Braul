const express = require("express");
const router = express.Router();

const { createPreference, handleWebhook } = require("../controllers/payment.controller");
const { verifyAuth } = require("../middlewares/auth");

// ─────────────────────────────────────────────
// RUTAS DE PAGOS
// ─────────────────────────────────────────────

// Crear preferencia de pago (requiere usuario logueado)
router.post("/create_preference", verifyAuth, createPreference);

// Webhook de Mercado Pago — SIN verifyAuth porque MP no manda token de usuario
// MP llamará a esta URL automáticamente cuando el pago cambie de estado
// Debes registrar esta URL en: https://www.mercadopago.com.ar/developers/panel/webhooks
// URL a registrar: https://tu-dominio.com/api/v1/payments/webhook
router.post("/webhook", handleWebhook);

module.exports = router;