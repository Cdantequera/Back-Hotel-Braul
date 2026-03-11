# 🏨 Hotel Bra'ul — Backend

API REST para la gestión del Hotel Bra'ul. Desarrollada con Node.js y Express, conectada a MongoDB y desplegada en Render.

---

## 🚀 Tecnologías Utilizadas

- **Node.js** — Entorno de ejecución
- **Express** — Framework HTTP
- **MongoDB + Mongoose** — Base de datos NoSQL
- **Morgan** — Logger de peticiones HTTP
- **CORS** — Control de acceso entre dominios
- **Cookie Parser** — Manejo de cookies
- **dotenv** — Variables de entorno

---

## 📁 Estructura del Proyecto

```
backend/
├── server.js                  # Punto de entrada principal
├── config/
│   └── database.js            # Conexión a MongoDB
├── routes/
│   ├── auth.routes.js         # Autenticación
│   ├── user.routes.js         # Usuarios
│   ├── room.routes.js         # Habitaciones
│   ├── booking.routes.js      # Reservas
│   ├── payment.routes.js      # Pagos
│   └── config.routes.js       # Configuración del sistema
├── middlewares/
│   └── errorHandler.js        # Manejo centralizado de errores
├── utils/
│   └── createSuperAdmin.js    # Crea el super admin al iniciar
└── uploads/
    └── rooms/                 # Imágenes de habitaciones (servidas estáticamente)
```

---

## ⚙️ Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
PORT=4000
FRONTEND_URL=https://hotel-braul.vercel.app
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/hotel-braul
JWT_SECRET=tu_secreto_jwt
```

---

## 🛠️ Instalación y Uso

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/hotel-braul-backend.git
cd hotel-braul-backend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# 4. Iniciar en desarrollo
npm run dev

# 5. Iniciar en producción
npm start
```

---

## 📡 Endpoints Disponibles

| Método | Base                   | Descripción                        |
|--------|------------------------|------------------------------------|
| `*`    | `/api/v1/auth`         | Registro, login, logout            |
| `*`    | `/api/v1/users`        | Gestión de usuarios                |
| `*`    | `/api/v1/rooms`        | CRUD de habitaciones               |
| `*`    | `/api/v1/bookings`     | CRUD de reservas                   |
| `*`    | `/api/v1/payments`     | Gestión de pagos                   |
| `*`    | `/api/v1/config`       | Configuración del sistema          |
| `GET`  | `/uploads/rooms/:file` | Imágenes estáticas de habitaciones |

---

## 🔐 Autenticación

La API utiliza **JWT (JSON Web Tokens)**. El token se envía en las peticiones protegidas y se gestiona mediante cookies (`cookie-parser`).

Al iniciar el servidor, `createSuperAdmin()` verifica si existe un super administrador en la base de datos y lo crea automáticamente si no existe, usando las credenciales definidas en las variables de entorno.

---

## 🌐 CORS

El servidor acepta peticiones únicamente desde el frontend autorizado:

```
FRONTEND_URL=https://hotel-braul.vercel.app
```

Las credenciales (cookies) están habilitadas (`credentials: true`). Para desarrollo local, modificá `FRONTEND_URL` en tu `.env` a `http://localhost:5173`.

---

## 📂 Archivos Estáticos

Las imágenes de habitaciones se sirven directamente desde la carpeta `/uploads`:

```
GET https://back-hotel-braul.onrender.com/uploads/rooms/nombre-imagen.jpg
```

---

## ☁️ Despliegue

El backend está desplegado en **[Render](https://render.com)**. La configuración de proxy (`trust proxy: 1`) está habilitada para que Express detecte correctamente las IPs y el protocolo HTTPS detrás del proxy de Render.

---

## 📄 Licencia

Este proyecto es de uso privado para Hotel Bra'ul.
