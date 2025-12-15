const User = require("../models/User");

// 1. Obtener todos los usuarios (Para el panel de Admin)
const getAllUsers = async (req, res) => {
    try {
        // Buscamos todos y ocultamos la contraseña por seguridad
        const users = await User.find().select("-password");
        
        return res.status(200).json({
            ok: true,
            count: users.length,
            users
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            message: "Error al obtener usuarios"
        });
    }
};

// 2. Obtener un solo usuario por ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select("-password");

        if (!user) {
            return res.status(404).json({
                ok: false,
                message: "Usuario no encontrado"
            });
        }

        return res.status(200).json({
            ok: true,
            user
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            message: "Error al buscar el usuario"
        });
    }
};

// 3. Cambiar el Rol de un usuario (Ej: de 'guest' a 'receptionist')
const changeUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body; // El nuevo rol viene en el body

        // Validamos que el rol sea uno de los permitidos (doble seguridad)
        if (!["huesped", "admin", "recepcionista"].includes(role)) {
            return res.status(400).json({
                ok: false,
                message: "Rol no válido"
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id, 
            { role }, 
            { new: true } // Esto hace que nos devuelva el usuario YA actualizado
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({
                ok: false,
                message: "Usuario no encontrado para actualizar"
            });
        }

        return res.status(200).json({
            ok: true,
            message: `Rol actualizado a ${role}`,
            user: updatedUser
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            message: "Error al actualizar el rol"
        });
    }
};

// 4. Eliminar usuario
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({
                ok: false,
                message: "Usuario no encontrado"
            });
        }

        return res.status(200).json({
            ok: true,
            message: "Usuario eliminado correctamente"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            message: "Error al eliminar usuario"
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    changeUserRole,
    deleteUser
};