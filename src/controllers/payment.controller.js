const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");
const Booking = require("../models/Booking");

// 1. Cliente configurado desde variable de entorno (NUNCA hardcodear el token)
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN,
});
console.log("TOKEN CARGADO:", process.env.MP_ACCESS_TOKEN ? "SÍ ✅" : "NO ❌");

// ─────────────────────────────────────────────
// 2. Crear Preferencia de Pago
// ─────────────────────────────────────────────
const createPreference = async (req, res, next) => {
    try {
        const { bookingId } = req.body;

        // Buscar la reserva y verificar que existe
        const booking = await Booking.findById(bookingId).populate('room');
        if (!booking) {
            return res.status(404).json({ ok: false, message: "Reserva no encontrada" });
        }

        // CORRECCIÓN: Verificar que la reserva pertenece al usuario autenticado
        if (booking.user.toString() !== (req.user.id || req.user._id).toString()) {
            return res.status(403).json({ ok: false, message: "No estás autorizado para pagar esta reserva" });
        }

        // Verificar que la reserva no fue ya pagada
        if (booking.paymentStatus === 'paid') {
            return res.status(400).json({ ok: false, message: "Esta reserva ya fue pagada" });
        }

        const preference = new Preference(client);

        const result = await preference.create({
            body: {
                items: [
                    {
                        title: `Reserva Hotel Bra'ul - ${booking.room.type}`,
                        unit_price: Number(booking.totalPrice),
                        quantity: 1,
                        currency_id: 'ARS'
                    },
                ],
                // CORRECCIÓN: URLs desde variables de entorno para que funcione en producción
                back_urls: {
                    success: `${process.env.FRONTEND_URL}/my-bookings?status=success`,
                    failure: `${process.env.FRONTEND_URL}/my-bookings?status=failure`,
                    pending: `${process.env.FRONTEND_URL}/my-bookings?status=pending`
                },
                auto_return: "approved",

                // CORRECCIÓN: Agregar referencia externa para identificar la reserva en el webhook
                external_reference: bookingId.toString(),

                // CORRECCIÓN: Metadata adicional como respaldo
                metadata: {
                    booking_id: bookingId.toString(),
                    user_id: (req.user.id || req.user._id).toString()
                }
            },
        });

        res.status(200).json({
            ok: true,
            preferenceId: result.id
        });

    } catch (error) {
        console.error("Error al crear preferencia MP:", error);
        next(error);
    }
};

// ─────────────────────────────────────────────
// 3. Webhook — Mercado Pago notifica el resultado del pago
//    Esta ruta NO lleva verifyAuth porque MP no envía token de usuario
// ─────────────────────────────────────────────
const handleWebhook = async (req, res) => {
    try {
        const { type, data } = req.body;

        // Solo nos interesan las notificaciones de tipo "payment"
        if (type !== 'payment') {
            return res.sendStatus(200);
        }

        // Obtener el detalle completo del pago desde la API de MP
        const paymentClient = new Payment(client);
        const payment = await paymentClient.get({ id: data.id });

        // Extraer el bookingId que guardamos en external_reference al crear la preferencia
        const bookingId = payment.external_reference;
        if (!bookingId) {
            console.warn("Webhook recibido sin external_reference:", data.id);
            return res.sendStatus(200);
        }

        // Actualizar la reserva según el estado del pago
        if (payment.status === 'approved') {
            await Booking.findByIdAndUpdate(bookingId, {
                paymentStatus: 'paid',
                status: 'confirmed'
            });
            console.log(`✅ Pago aprobado para reserva ${bookingId}`);

        } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
            await Booking.findByIdAndUpdate(bookingId, {
                paymentStatus: 'pending' // Puede volver a intentar
            });
            console.log(`❌ Pago rechazado/cancelado para reserva ${bookingId}`);

        } else if (payment.status === 'in_process' || payment.status === 'pending') {
            // Pago en revisión (ej: transferencia bancaria)
            console.log(`⏳ Pago pendiente para reserva ${bookingId}`);
        }

        // Siempre responder 200 para que MP no reintente el webhook
        res.sendStatus(200);

    } catch (error) {
        console.error("Error en webhook MP:", error);
        // Igualmente respondemos 200 para evitar reintentos infinitos de MP
        res.sendStatus(200);
    }
};

module.exports = { createPreference, handleWebhook };