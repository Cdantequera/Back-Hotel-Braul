const fs = require('fs');
const path = require('path');

// Eliminar un archivo individual
const deleteOneFile = (filePath) => {
    try {
        if(fs.existsSync(filePath)){
            fs.unlinkSync(filePath);
            console.log(`🗑 Archivo eliminado: ${filePath}`);
        }
    } catch (error) {
        console.error(`❌ Error al eliminar archivo ${filePath} : ${error.message}`)
    }
}

// Eliminar múltiples archivos (Array)
const deleteFiles = (filePaths) => {
    if(!Array.isArray(filePaths)){
        filePaths = [filePaths]
    }

    filePaths.forEach(filePath => {
        if(filePath){
            deleteOneFile(filePath)
        }
    });
}

// Eliminar archivos subidos por Multer en caso de error (req.file o req.files)
const cleanUploadsFiles = (req) => {
    // Caso 1: Archivo único (ej: imagen de habitación)
    if(req.file){
        deleteOneFile(req.file.path)
    }

    // Caso 2: Múltiples archivos (si agregamos galería en el futuro)
    if(req.files && Array.isArray(req.files)){
        req.files.forEach(file => deleteOneFile(file.path))
    }
}

// Helper para obtener rutas completas
const getCompleteRoute = (filename, type) => {
    // type será 'rooms' o 'users' (aunque usuarios ya no tienen foto, rooms sí)
    return path.join(__dirname, `../../uploads/${type}`, filename)
}

module.exports = {
    deleteOneFile,
    cleanUploadsFiles,
    getCompleteRoute,
    deleteFiles
}