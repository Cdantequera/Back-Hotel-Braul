const SiteConfig = require('../models/SiteConfig');

// GET /api/v1/config
// Público - Footer y Contact lo usan sin autenticación
const getConfig = async (req, res, next) => {
    try {
        // findOne sin filtro devuelve el único documento, o null si no existe aún
        let config = await SiteConfig.findOne({ singleton: true });

        // Si no existe todavía, creamos uno vacío con defaults
        if (!config) {
            config = await SiteConfig.create({ singleton: true });
        }

        res.status(200).json({ ok: true, config });
    } catch (error) {
        next(error);
    }
};

// PUT /api/v1/config
// Solo Admin
const updateConfig = async (req, res, next) => {
    try {
        const { phone, whatsapp, email, instagram, facebook, twitter } = req.body;

        // findOneAndUpdate con upsert:true crea el documento si no existe
        const config = await SiteConfig.findOneAndUpdate(
            { singleton: true },
            { phone, whatsapp, email, instagram, facebook, twitter },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({ ok: true, message: 'Configuración actualizada', config });
    } catch (error) {
        next(error);
    }
};

module.exports = { getConfig, updateConfig };