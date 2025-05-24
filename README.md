Aplicación de Búsqueda de Grabaciones
Descripción
Aplicación web para búsqueda y descarga de grabaciones de audio almacenadas en Google Cloud Storage. Permite filtrar por diferentes criterios como fecha, hora, rango de fechas/horas y número telefónico.

Tecnologías Utilizadas
Frontend: React + Vite
Backend: Node.js + Express
Base de datos: Google BigQuery
Almacenamiento: Google Cloud Storage
Estilos: TailwindCSS
Estructura del Proyecto
├── client/               # Frontend React
│   ├── src/             
│   │   ├── Components/  # Componentes React
│   │   ├── Helpers/    # Utilidades y helpers
│   │   └── Hooks/      # Custom hooks
│   └── ...
└── server/              # Backend Node.js
    ├── server.mjs      # Servidor Express
    └── ...
Requisitos
Node.js >= 18
NPM o Yarn
Credenciales de Google Cloud Platform
Instalación
Backend
cd server
npm install
Frontend
cd client
npm install
Variables de Entorno
Backend (.env)
PORT=9090
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
BUCKET_NAME=nombre_bucket_storage
Frontend (.env)
VITE_API_SERVER=http://localhost:9090/analytics_app_audios/
Ejecución
Backend
# Desarrollo
npm run start:dev

# Producción 
npm run start:prod

# Certificación
npm run start:cert

Frontend
# Desarrollo
npm run dev

# Producción
npm run build:prod

# Certificación  
npm run build:cert

Características Principales
Login de usuarios
Búsqueda por fecha/hora específica
Búsqueda por rango de fechas/horas
Búsqueda por número telefónico
Descarga de audios en formato MP3
Exportación a Excel
Tour interactivo de la aplicación
