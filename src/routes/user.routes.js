const express = require("express");
const router = express.Router();
const { getAllUsers, 
        createUser, 
        getUserById, 
        updateUser, 
        deleteUser 
    } = require("../controllers/user.controller");

    //Leer todos los usuarios
    //URL final: http://localhost:4000/api/v1/users
    router.get("/", getAllUsers);
    //Crear un nuevo usuario
    //URL final: http://localhost:4000/api/v1/users
    router.post("/", createUser);
    //Leer un usuario por ID
    //URL final: http://localhost:4000/api/v1/users/:id
    router.get("/:id", getUserById);
    //Actualizar un usuario por ID
    //URL final: http://localhost:4000/api/v1/users/:id
    router.put("/:id", updateUser);
    //Eliminar un usuario por ID
    //URL final: http://localhost:4000/api/v1/users/:id
    router.delete("/:id", deleteUser);

module.exports = router;