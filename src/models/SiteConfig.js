const mongoose = require('mongoose');

// Solo existirá UN documento de configuración en toda la colección.
// Lo manejamos con un campo fijo "singleton: true" para siempre encontrar el mismo.
const siteConfigSchema = new mongoose.Schema({
    singleton: {
        type: Boolean,
        default: true,
        unique: true  // garantiza que solo haya un documento
    },
    phone: {
        type: String,
        default: ''
    },
    whatsapp: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    instagram: {
        type: String,
        default: ''
    },
    facebook: {
        type: String,
        default: ''
    },
    twitter: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('SiteConfig', siteConfigSchema);