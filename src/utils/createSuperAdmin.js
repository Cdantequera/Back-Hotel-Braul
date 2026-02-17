const User = require("../models/User");

const createSuperAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD; // Asegúrate de tener esto en tu .env

        // 1. Buscamos si existe
        let adminUser = await User.findOne({ email: adminEmail });

        if (adminUser) {
            console.log(`⚠️ El usuario ${adminEmail} ya existe. ACTUALIZANDO contraseña y permisos...`);
            
            // --- AQUÍ ESTÁ LA MAGIA: Sobrescribimos los datos ---
            adminUser.password = adminPassword; // Esto activará el hasheo automático
            adminUser.role = "admin";
            adminUser.verifiedEmail = true;
            adminUser.active = true;
            
            await adminUser.save();
            console.log("✅ Super Admin ACTUALIZADO: Contraseña sincronizada con el .env");
        } else {
            // 2. Si no existe, lo creamos
            adminUser = new User({
                name: process.env.ADMIN_NAME || "Super",
                surname: process.env.ADMIN_SURNAME || "Admin",
                email: adminEmail,
                password: adminPassword,
                role: "admin", 
                verifiedEmail: true,
                active: true
            });

            await adminUser.save();
            console.log("✅ Super Admin CREADO exitosamente.");
        }

    } catch (error) {
        console.error(`❌ Error:`, error.message);
    }
}

module.exports = createSuperAdmin;