const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const filePath = path.resolve(__dirname, "../data/user.json");

function readData() {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeData(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}



const getUserById = (req, res) => {
    try {
    const {id} = req.params; //capturamos el id que viaja en el parametro de la ruta 
    const users = readData();
    const exist = users.find((u) => u.id === id);

    if (!exist) {
    return res.status(404).json({
        ok: false,
        msj: "El usuario no existe"
    });
    }

    return res.status(200).json({
        ok: true,
        msj: "Usuario obtenido exitosamente",
        user: {
            id: exist.id,
            email: exist.email
        }
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msj: "Error al obtener el usuario"
    });
  }
};

const createUser = (req, res) => {
    try {
    const { email, password, role } = req.body;

    if (!email || !password) {
        return res.status(400).json({ ok: false, msj: "Faltan datos obligatorios" });
    }

    const users = readData();
    if (users.find((u) => u.email === email)) {
        return res.status(409).json({ ok: false, msj: "El email ya existe" });
    }

    const newUser = {
        id: crypto.randomUUID(),
        email,
        password,
        role: role || "user" // Si no mandan rol, por defecto es user
    };

    users.push(newUser);
    writeData(users);

    return res.status(201).json({ ok: true, msj: "Usuario creado", user: newUser });
    } catch (error) {
    return res.status(500).json({ ok: false, msj: "Error al crear usuario" });
    }
};

const updateUser = (req, res) => {
    try {
    const { id } = req.params;
    const users = readData(); // 1. Leemos

    const userIndex = users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
        return res.status(404).json({ ok: false, msj: "Usuario no encontrado" });
    }

    // 2. Modificamos el usuario en memoria
    users[userIndex] = {
        ...users[userIndex],
        ...req.body, 
        id: id // Protegemos el ID para que no cambie
    };

    //Guardamos en el archivo
    writeData(users);

    return res.status(200).json({ 
        ok: true, 
        msj: "Usuario actualizado", 
        user: users[userIndex] 
    });

    } catch (error) {
        return res.status(500).json({ ok: false, msj: "Error al actualizar" });
    }
};

const getAllUsers = (req, res) => {
    try {
    const users = readData();
    if (users.length === 0){
        return res.status(404).json({
            ok: false,
            msj: "No se encontraron usuarios"
        });
    }
    return res.status(200).json({
        ok: true,
        msj: "Lista de usuarios obtenida exitosamente",
        data:{
            length: users.length,
            users
        },
    
    });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msj: "Error al obtener los usuarios"
        });
    }
}

const deleteUser = (req, res) => {
    try {
    const {id} = req.params; //capturamos el id que viaja en el parametro de la ruta 
    const users = readData();
    const exist = users.find((u) => u.id === id);


    if (!exist) {
    return res.status(404).json({
        ok: false,
        message: "El usuario no existe"
    });
    }

    const filteredUsers = users.filter((u) => u.id !== id);
    
    writeData(filteredUsers);


    return res.status(200).json({
        ok: true,
        message: "Usuario eliminado exitosamente",
        deletedUser: {
            id: exist.id,
            email: exist.email
        }
    });


    } catch (error) {
    console.log(error);
    return res.status(500).json({
        ok: false,
        msj: "Error al eliminar el usuario"
    });
    }
};

module.exports = {
    getUserById,
    createUser,
    updateUser,
    getAllUsers,
    deleteUser
};




