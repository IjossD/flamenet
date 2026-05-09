# FlameNet

> Plataforma full-stack conectada con hardware IoT para monitoreo, visualización y gestión de datos en tiempo real.

<p align="center">
  <img src="https://img.shields.io/badge/Status-En%20desarrollo-00b894?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Frontend-Web-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Backend-API-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/ESP32-IoT-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/License-MIT-black?style=for-the-badge" />
</p>

---

# 📖 Descripción

**FlameNet** prubea es una aplicación full-stack diseñada para integrar una interfaz web moderna con dispositivos IoT basados en ESP32, permitiendo el envío, recepción y visualización de datos en tiempo real.

El proyecto está enfocado en una arquitectura modular y escalable, separando:

- 🌐 Frontend Web
- ⚙️ Backend/API
- 📡 Comunicación con hardware
- 🗄️ Persistencia de datos
- ☁️ Integración de servicios externos

---

# ✨ Características principales

- 📊 Visualización de datos en tiempo real
- 🔌 Integración con ESP32
- 🌐 API REST para comunicación entre servicios
- 📡 Envío y recepción de información desde hardware
- 🔐 Sistema preparado para autenticación y seguridad
- 📈 Arquitectura escalable y modular
- ⚡ Comunicación eficiente entre frontend y backend
- 🧩 Separación clara de responsabilidades

---

# 🏗️ Arquitectura del proyecto

```bash
Proyectoo/
│
├── frontend/          # Interfaz web
├── backend/           # API y lógica de negocio
├── esp32/             # Código del microcontrolador
├── docs/              # Documentación            # Recursos estáticos
└── README.md
```

---

# 🛠️ Tecnologías utilizadas

## Frontend

- Css / Next.js
- TailwindCSS
- Chart.js / Recharts

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Socket.IO

## IoT / Hardware

- ESP32
- Arduino Framework
- WiFi Manager
- Sensores MQ-4, MQ-2, MQ-135

## DevOps y herramientas

- Git & GitHub
- Postman
- VS Code

---

# 🔌 APIs y comunicación

## API REST

La aplicación utiliza una API REST para conectar el frontend con el backend y permitir la interacción con los dispositivos.

### Ejemplo de endpoints

```http
GET /api/data
POST /api/data
GET /api/status
POST /api/device/connect
```

### Ejemplo de respuesta

```json
{
  "status": "online",
  "temperature": 26.4,
  "humidity": 71
}
```

---

# ⚙️ Variables de entorno

Crea un archivo `.env` en el backend:

```env
PORT=3000
MONGO_URI=your_database_url
JWT_SECRET=your_secret_key
API_URL=http://localhost:3000
```

---

# 🚀 Instalación

## 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/IjossD/Proyectoo.git
cd Proyectoo
```

---

## 2️⃣ Instalar dependencias

### Frontend

```bash
cd frontend
npm install
```

### Backend

```bash
cd backend
npm install
```

---

## 3️⃣ Ejecutar el proyecto

### Backend

```bash
npm run dev
```

### Frontend

```bash
npm run dev
```

---

# 📡 Configuración ESP32

1. Instalar el PlattformIO en vscode
2. Seleccionar la placa ESP32 correspondiente (en nuestro caso el dev module)
3. Configurar credenciales WiFi
4. Configurar URL de la API
5. Subir el firmware contenido en la carpeta esp32/

Ejemplo:

```cpp
const char* ssid = "YOUR_WIFI";
const char* password = "YOUR_PASSWORD";
const char* serverUrl = "http://YOUR_API/api/data";
```

---

# 📷 Capturas del proyecto

> hey aquí pongan capturitas de la interfaz web, dashboard y funcionamiento.

```md
/assets/screenshots/
```

---

# 🔄 Flujo del sistema

```text
ESP32 → API REST → Base de datos → Backend → Frontend
```

---

# 📚 Roadmap

- [ ] Sistema de autenticación
- [ ] Dashboard avanzado
- [ ] WebSockets en tiempo real
- [ ] Notificaciones
- [ ] Dockerización
- [ ] Despliegue en la nube
- [ ] Integración de más sensores

---

# 🧪 Testing

```bash
npm run test
```

---

# 🤝 Contribuciones

Las contribuciones son bienvenidas.

1. Fork del proyecto
2. Crear rama:

```bash
git checkout -b feature/nueva-funcionalidad
```

3. Commit:

```bash
git commit -m "feat: nueva funcionalidad"
```

4. Push:

```bash
git push origin feature/nueva-funcionalidad
```

5. Crear Pull Request

---

# 👨‍💻 Autores

- Oscar Llanos
- Nelson Sierra
- Joseph De La Rans

---

# 📄 Licencia

Este proyecto está bajo el dominio de la Grasa.

---

# ⭐ Support

Si te gustó el proyecto:

- Dale una ⭐ al repositorio
- Comparte el proyecto
- Contribuye con mejoras

---

<p align="center">
  Made with ❤️ and lots of coffee.
</p>
