# 📋 Proyecto Backend - API de Gestión de Proyectos

Una API REST desarrollada con Node.js, Express y MongoDB para la gestión de proyectos y tareas.

## 🚀 Características

- ✅ CRUD completo para proyectos
- ✅ Gestión de tareas dentro de proyectos
- ✅ Middleware de logging personalizado
- ✅ Conexión a MongoDB con Mongoose
- ✅ Manejo de errores robusto
- ✅ CORS habilitado
- ✅ Variables de entorno configurables

## 🛠️ Tecnologías Utilizadas

- **Node.js** - Entorno de ejecución
- **Express.js** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **CORS** - Middleware para peticiones cross-origin
- **dotenv** - Gestión de variables de entorno
- **Nodemon** - Desarrollo en modo watch

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (versión 16 o superior)
- [MongoDB](https://www.mongodb.com/) (local o remoto)
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)

## ⚡ Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd proyecto-backend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Copia el archivo de ejemplo y configura tus variables:
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones:
```env
# Database Configuration
MONGODB_URI=mongoConnectionChain

# Server Configuration
PORT=3000
```

### 4. Iniciar MongoDB
Asegúrate de que MongoDB esté ejecutándose:
```bash

atlas mongodb
```

### 5. Ejecutar el proyecto

#### Modo desarrollo (con nodemon):
```bash
npm run dev
```

#### Modo producción:
```bash
npm start
```

El servidor estará disponible en: `http://localhost:3000`