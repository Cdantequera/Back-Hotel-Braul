# Hotel Management System - Backend

Backend de un sistema de gestión hotelera construido con **Node.js**, **Express** y **MongoDB**. Proporciona una API RESTful completa para gestionar usuarios, habitaciones, reservas, pagos y configuración del sitio.

---

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [API Endpoints](#api-endpoints)
- [Bases de Datos](#bases-de-datos)
- [Variables de Entorno](#variables-de-entorno)
- [Autenticación](#autenticación)
- [Contribución](#contribución)

---

## ✨ Características

- ✅ Autenticación con JWT y seguridad con bcrypt
- ✅ Gestión de usuarios (registro, login, perfil)
- ✅ Gestión de habitaciones (CRUD completo)
- ✅ Sistema de reservas y bookings
- ✅ Integración con Mercado Pago para pagos
- ✅ Upload de imágenes para habitaciones
- ✅ Rate limiting para proteger la API
- ✅ Validación de datos con express-validator
- ✅ Manejo robusto de errores
- ✅ Soporte para CORS configurado
- ✅ Logs detallados con Morgan
- ✅ Notificaciones por email

---

## 🛠️ Tecnologías

### Runtime & Framework
- **Node.js** - Entorno de ejecución
- **Express.js** - Framework web
- **nodemon** - Reinicio automático en desarrollo

### Base de Datos
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB

### Autenticación & Seguridad
- **jsonwebtoken (JWT)** - Tokens de autenticación
- **bcrypt** - Encriptación de contraseñas
- **express-rate-limit** - Limitador de tasa de solicitudes
- **cors** - Control de origen cruzado

### Funcionalidades
- **multer** - Carga de archivos
- **mercadopago** - Integración de pagos
- **nodemailer** - Envío de emails
- **express-validator** - Validación de datos
- **morgan** - Logging HTTP
- **dotenv** - Variables de entorno
- **cookie-parser** - Manejo de cookies

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (v14 o superior)
- **npm** o **yarn**
- **MongoDB** (local o Atlas)

Verifica las versiones:
```bash
node --version
npm --version
```

---

## 🚀 Instalación

### 1. Clonar el repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd Hotel/Back
```

### 2. Instalar dependencias
```bash
npm install
```

---

## ⚙️ Configuración

### 1. Crear archivo `.env`

Crea un archivo `.env` en la raíz de la carpeta `Back` con las siguientes variables:

```env
# Base de Datos
MONGO_URI=mongodb+srv://<usuario>:<contraseña>@<host>/<base_de_datos>

# Puerto
PORT=5000

# JWT
JWT_SECRET=tu_clave_secreta_super_segura

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_app

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=tu_token_mercado_pago

# URLs Frontend
FRONTEND_URL=http://localhost:5173
FRONTEND_PROD_URL=https://hotel-braul.vercel.app

# CORS
CORS_ORIGIN=http://localhost:5173

# Admin Super Usuario (se crea automáticamente)
SUPER_ADMIN_EMAIL=admin@hotel.com
SUPER_ADMIN_PASSWORD=AdminPassword123

# Node Environment
NODE_ENV=development
```

### 2. Configurar MongoDB

#### Opción A: MongoDB Local
- Instala MongoDB en tu máquina
- Inicia el servicio: `mongod`

#### Opción B: MongoDB Atlas (Recomendado)
1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un cluster
3. Obtén la URI de conexión
4. Colócala en `MONGO_URI` del archivo `.env`

---

## ▶️ Ejecución

### Modo Desarrollo
```bash
npm run dev
```
El servidor se iniciará en `http://localhost:5000` con reinicio automático.

### Modo Producción
```bash
node src/server.js
```

---

## 📁 Estructura del Proyecto

```
Back/
├── src/
│   ├── server.js                 # Punto de entrada principal
│   ├── config/
│   │   ├── database.js          # Configuración de MongoDB
│   │   └── multer.js            # Configuración de carga de archivos
│   ├── controllers/              # Lógica de negocio
│   │   ├── auth.controller.js
│   │   ├── booking.controller.js
│   │   ├── payment.controller.js
│   │   ├── room.controller.js
│   │   ├── user.controller.js
│   │   └── config.controller.js
│   ├── middlewares/              # Middlewares personalizados
│   │   ├── auth.js              # Autenticación JWT
│   │   ├── errorHandler.js      # Manejo de errores
│   │   ├── rate.limiter.js      # Limitador de solicitudes
│   │   └── validator.js         # Validación de datos
│   ├── models/                   # Modelos de Mongoose
│   │   ├── User.js
│   │   ├── Room.js
│   │   ├── Booking.js
│   │   └── SiteConfig.js
│   ├── routes/                   # Definición de rutas
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── room.routes.js
│   │   ├── booking.routes.js
│   │   ├── payment.routes.js
│   │   └── config.routes.js
│   ├── utils/                    # Funciones utilitarias
│   │   ├── createSuperAdmin.js  # Crea admin al iniciar
│   │   ├── emailservice.js      # Servicio de emails
│   │   └── fileCleanup.js       # Limpieza de archivos
│   └── uploads/                  # Archivos subidos
│       └── rooms/               # Imágenes de habitaciones
├── package.json
└── README.md
```

---

## 🔌 API Endpoints

### Autenticación (`/api/auth`)
- `POST /register` - Registrar nuevo usuario
- `POST /login` - Iniciar sesión
- `POST /logout` - Cerrar sesión
- `POST /refresh-token` - Refrescar JWT
- `POST /forgot-password` - Solicitar reset de contraseña
- `POST /reset-password` - Resetear contraseña

### Usuarios (`/api/users`)
- `GET /profile` - Obtener perfil del usuario actual
- `PUT /profile` - Actualizar perfil
- `GET /` - Listar todos los usuarios (Admin)
- `DELETE /:id` - Eliminar usuario (Admin)

### Habitaciones (`/api/rooms`)
- `GET /` - Listar todas las habitaciones
- `GET /:id` - Obtener detalles de una habitación
- `POST /` - Crear habitación (Admin)
- `PUT /:id` - Actualizar habitación (Admin)
- `DELETE /:id` - Eliminar habitación (Admin)

### Reservas (`/api/bookings`)
- `GET /` - Listar reservas del usuario
- `POST /` - Crear nueva reserva
- `GET /:id` - Obtener detalles de reserva
- `PUT /:id` - Actualizar reserva
- `DELETE /:id` - Cancelar reserva

### Pagos (`/api/payments`)
- `POST /create-preference` - Crear preferencia de pago en Mercado Pago
- `GET /success` - Callback de pago exitoso
- `GET /pending` - Callback de pago pendiente
- `GET /failure` - Callback de pago fallido

### Configuración (`/api/config`)
- `GET /` - Obtener configuración del sitio
- `PUT /` - Actualizar configuración (Admin)

---

## 💾 Bases de Datos

### Modelos MongoDB

#### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  address: String,
  role: String (user/admin),
  profileImage: String,
  emailVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Room
```javascript
{
  name: String,
  description: String,
  price: Number,
  capacity: Number,
  amenities: [String],
  images: [String],
  isAvailable: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Booking
```javascript
{
  userId: ObjectId (ref: User),
  roomId: ObjectId (ref: Room),
  checkInDate: Date,
  checkOutDate: Date,
  totalPrice: Number,
  status: String (pending/confirmed/cancelled),
  paymentId: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### SiteConfig
```javascript
{
  siteName: String,
  siteDescription: String,
  contactEmail: String,
  contactPhone: String,
  address: String,
  logo: String,
  currency: String,
  updatedAt: Date
}
```

---

## 🔑 Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| MONGO_URI | URI de conexión a MongoDB | mongodb+srv://user:pass@host/db |
| PORT | Puerto del servidor | 5000 |
| JWT_SECRET | Clave secreta para JWT | mysecretkey123 |
| EMAIL_HOST | Host SMTP para emails | smtp.gmail.com |
| EMAIL_PORT | Puerto SMTP | 587 |
| EMAIL_USER | Email para enviar | your@gmail.com |
| EMAIL_PASS | Contraseña app de email | apppassword |
| MERCADOPAGO_ACCESS_TOKEN | Token de Mercado Pago | APP_USR_xxxxx |
| FRONTEND_URL | URL del frontend en desarrollo | http://localhost:5173 |
| CORS_ORIGIN | Origen permitido para CORS | http://localhost:5173 |
| NODE_ENV | Ambiente | development/production |

---

## 🔐 Autenticación

### JWT (JSON Web Token)

1. El usuario se registra/inicia sesión
2. El servidor devuelve un JWT en el header `Authorization`
3. El cliente envía el JWT en futuras solicitudes
4. El middleware `auth.js` valida el token

### Headers Requeridos
```
Authorization: Bearer <tu_jwt_token>
```

### Roles
- **user** - Usuario normal (cliente)
- **admin** - Administrador (gestión completa)

---

## 📧 Notificaciones por Email

El sistema envía emails automáticos para:
- Confirmación de registro
- Reset de contraseña
- Confirmación de reserva
- Notificaciones de pago

**Configuración requerida:**
1. Gmail con contraseña de aplicación
2. O usar otro proveedor SMTP

---

## 🐛 Solución de Problemas

### Error: "MONGO_URI not defined"
- Verifica que el archivo `.env` exista
- Asegúrate de que `MONGO_URI` esté configurado correctamente

### Error: "Cannot connect to MongoDB"
- Verifica la conexión a internet
- Comprueba las credenciales de MongoDB Atlas
- Asegúrate de que tu IP esté en la lista blanca de Atlas

### Error: "CORS policy blocked"
- Verifica que `allowedOrigins` en `server.js` incluya tu frontend URL
- Comprueba la variable `FRONTEND_URL` en `.env`

### Puertos en uso
- Cambia el `PORT` en `.env` si el puerto 5000 está ocupado

---

## 🚀 Despliegue

### Desplegar en Render o Heroku

1. Commitea los cambios a GitHub
2. Conecta tu repositorio con Render/Heroku
3. Configura las variables de entorno en el panel
4. El despliegue se realizará automáticamente

---

## 📝 Notas Importantes

- El super admin se crea automáticamente al iniciar el servidor
- Los archivos de upload se guardan en `Back/uploads/rooms/`
- Los tokens JWT expiran en 24 horas
- La API usa limitador de tasas para prevenir abuso
- Todos los emails deben estar verificados en Gmail si usas Gmail

---

## 📄 Licencia

ISC

---

## 👨‍💻 Autores

Desarrollado como parte del sistema de gestión hotelera

---

## 📞 Soporte

Para reportar bugs o sugerencias, contacta al equipo de desarrollo.

---

**¡Listo! Tu backend está configurado y listo para usar.** 🎉
