const SiteConfig = require('../models/SiteConfig');

// GET /api/v1/config - Público
const getConfig = async (req, res, next) => {
    try {
        // Buscar el documento singleton
        let config = await SiteConfig.findOne({ singleton: true });

        // Si no existe, crearlo con valores por defecto seguros
        if (!config) {
            config = await SiteConfig.create({
                singleton: true,
                phone: '',
                whatsapp: '',
                email: '',
                instagram: '',
                facebook: '',
                twitter: ''
            });
        }

        res.status(200).json({ ok: true, config });
    } catch (error) {
        next(error);
    }
};

// PUT /api/v1/config - Solo Admin
const updateConfig = async (req, res, next) => {
    try {
        const { phone, whatsapp, email, instagram, facebook, twitter } = req.body;

        const config = await SiteConfig.findOneAndUpdate(
            { singleton: true },
            { phone, whatsapp, email, instagram, facebook, twitter },
            { 
                new: true, 
                upsert: true, 
                setDefaultsOnInsert: true, // Aplica defaults del esquema al insertar
                runValidators: true 
            }
        );

        res.status(200).json({ ok: true, message: 'Configuración actualizada', config });
    } catch (error) {
        next(error);
    }
};

module.exports = { getConfig, updateConfig };