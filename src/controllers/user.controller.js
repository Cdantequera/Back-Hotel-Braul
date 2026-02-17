const User = require("../models/User");

// --- OBTENER TODOS LOS USUARIOS ---
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json({ ok: true, data: users });
  } catch (error) {
    next(error);
  }
}

// --- OBTENER POR ID ---
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    if (!user) return res.status(404).json({ ok: false, message: "Usuario no encontrado" });
    return res.status(200).json({ ok: true, data: user });
  } catch (error) {
    next(error);
  }
};

// --- ACTUALIZAR USUARIO (Incluye lógica de Creación de Admins) ---
const updateUser = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { password, active, role, ...updateData } = req.body; 
      
      // Variable para identificar al Super Admin
      const isSuperAdmin = req.user.email === process.env.ADMIN_EMAIL;

      // 1. REGLA: Solo el Super Admin puede crear nuevos administradores
      if (role && role === 'admin') {
          if (!isSuperAdmin) {
              return res.status(403).json({ 
                  ok: false, 
                  message: "Acceso denegado. Solo el Super Admin puede nombrar nuevos administradores." 
              });
          }
          // Si es Super Admin, permitimos que actualice el rol
          updateData.role = role;
      }

      // Si intentan cambiar el rol a 'user' (degradar), también podrías restringirlo al Super Admin si quieres
      // Por ahora, aplicamos la lógica general si se envió un rol distinto de admin
      if (role && role !== 'admin') {
         updateData.role = role;
      }
  
      const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select("-password");
  
      if (!updatedUser) return res.status(404).json({ok: false, message: "Usuario no encontrado"});
  
      return res.status(200).json({
        ok: true,
        message: "Usuario actualizado",
        data: updatedUser
      });
  
    } catch (error) {
      next(error);
    }
} 

// SUSPENDER / ACTIVAR CUENTA 
const toggleUserStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ ok: false, message: "Usuario no encontrado" });

        // Protección extra: No desactivar al Super Admin
        if (user.email === process.env.ADMIN_EMAIL) {
             return res.status(403).json({ ok: false, message: "No puedes desactivar al Super Admin" });
        }

        user.active = !user.active;
        await user.save();

        const statusMsg = user.active ? "activado" : "suspendido";
        return res.status(200).json({ ok: true, message: `Usuario ${statusMsg} exitosamente`, data: { id: user._id, active: user.active } });

    } catch (error) {
        next(error);
    }
}

// ELIMINAR USUARIO 
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;       // El ID del usuario a eliminar 
    const requester = req.user;      // El usuario que hace la petición
    
    // 1. Buscamos a la víctima
    const userToDelete = await User.findById(id);
    if (!userToDelete) return res.status(404).json({ ok: false, message: "Usuario no encontrado" });

    // --- REGLAS DE JERARQUÍA ---

    // A. No eliminarse a sí mismo
    // (req.user._id viene como objeto, userToDelete._id tambien, los pasamos a String para comparar)
    if (requester._id.toString() === userToDelete._id.toString()) {
        return res.status(400).json({ 
            ok: false, 
            message: "No puedes eliminarte a ti mismo." 
        });
    }

    // B. Nadie puede eliminar al Super Admin
    if (userToDelete.email === process.env.ADMIN_EMAIL) {
        return res.status(403).json({ 
            ok: false, 
            message: "ACCIÓN DENEGADA: El Super Administrador es intocable." 
        });
    }

    // C. Lógica Admin vs Admin
    // Si la victima es Admin...
    if (userToDelete.role === 'admin') {
        // ... Y el que pide NO es el Super Admin ...
        if (requester.email !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({ 
                ok: false, 
                message: "Un Administrador no puede eliminar a otro Administrador. Contacta al Super Admin." 
            });
        }
        // Si es Super Admin, SÍ puede borrar a otro admin. Pasa.
    }

    // --- FIN REGLAS ---

    // Procedemos a eliminar
    await User.findByIdAndDelete(id); 

    return res.status(200).json({
      ok: true,
      message: "Usuario eliminado exitosamente"
    });

  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  toggleUserStatus,
  deleteUser
}