# 🏨 Hotel Braul - Backend API

Este repositorio contiene la arquitectura de Node.js y Express que potencia la infraestructura detrás de **Hotel Braul**. La API expone servicios robustos tanto para la interconexión con el portal de reservas público como para un panel de administración restringido.

## 🚀 Pila de Tecnologías

- **Motor:** Node.js + Express
- **Base de Datos:** MongoDB centralizado, operado mediante Mongoose ODM.
- **Seguridad:**
  - `bcrypt` para el hash asimétrico de contraseñas de los usuarios y administradores.
  - `jsonwebtoken` para la sesión segura basada en tokens (JWT).
  - `cors` implementado y configurado de forma dinámica para prevenir accesos desde orígenes no autorizados.
  - `express-rate-limit` para evitar el spam de formularios (DDoS mitigation).
- **Procesamiento de Archivos:** `multer` combinado con `cloudinary` para el alojamiento optimizado de las imágenes de las habitaciones.
- **Pagos / Notificaciones:** Integración pasiva modelizada con soporte para MercadoPago.

## 📁 Estructura del Código

```text
src/
├── config/             # Configuración de base de datos y Cloudinary
├── controllers/        # Lógica de negocio agrupada (Auth, Rooms, Bookings, Contact, Config)
├── middlewares/        # Capas de validación (Errores globales, JWT Auth, Rol Admin, Validadores Express)
├── models/             # Esquemas de Mongoose (User, Room, Booking, ContactMessage, SiteConfig)
├── routes/             # Endpoints HTTP definidos
├── utils/              # Funciones auxiliares genéricas y scripts de arranque (createSuperAdmin)
└── server.js           # Punto de arranque principal del servidor Express
```

## ✨ Funcionalidades Destacadas

1. **Gestión de Cuentas (Auth & Users):** Registro público de usuarios e inicialización automática de una consola `SuperAdmin`.
2. **Motores de Reservas (Bookings):** 
   - Generación de reserva lógica (Fechas de Check-In/Check-out) vinculada unívocamente a los usuarios.
   - Prevención de desbordamiento (Overbooking) mediante consultas `$or` en MongoDB.
3. **Control de Habitaciones (Rooms):**
   - Sistema CRUD para que el administrador cree entornos.
   - Validación integral que *prohíbe eliminar habitaciones* si éstas están actualmente cursando una reserva activa, salvaguardando la integridad de datos.
4. **Buzón de Contacto:** Receptor HTTP del lado del servidor para consultas de público general, con Rate Limit (5 por cada quince min. por IP).
5. **Configuración de Sitio (Config):** Patrón "Singleton" en MongoDB para mantener un registro único de los metadatos de la empresa (Teléfonos, Redes).

## 🧰 Guía de Arranque Local

1. Clona el proyecto y genera la instalación inicial:
   ```bash
   npm install
   ```

2. Crea tu archivo de entorno configurando las llaves locales.
   ```env
   PORT=4000
   MONGO_URI=mongodb+srv://<usuario>:<password>@cluster.mongodb.net/hotel?retryWrites=true&w=majority
   JWT_SECRET=tu_secreto_super_seguro
   
   # Cloudinary (Para imágenes de habitaciones)
   CLOUDINARY_CLOUD_NAME=tu_cloud_name
   CLOUDINARY_API_KEY=tu_api_key
   CLOUDINARY_API_SECRET=tu_api_secret
   ```

3. Arranca el motor en entorno de desarrollo (con recarga automática mediante Nodemon):
   ```bash
   npm run dev
   ```

La API quedará expuesta escuchando el puerto estipulado (por defecto `:4000`).

---
*Diseñado con arquitectura limpia y enfocado en la integridad operacional para una gestión hotelera de largo recorrido.*
