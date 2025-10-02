# FinteraUI

Una aplicación web moderna para la gestión financiera de contratos inmobiliarios, desarrollada con React y Vite. Permite administrar proyectos, lotes, contratos, pagos, usuarios y reportes de manera eficiente y segura.

## 🚀 Características Principales

- **Gestión de Usuarios**: Creación, edición y administración de usuarios con roles (admin, seller, user)
- **Proyectos y Lotes**: Creación y gestión de proyectos inmobiliarios con lotes individuales
- **Contratos**: Reserva, aprobación, rechazo y cancelación de contratos con plan de pagos
- **Pagos**: Aplicación de pagos, abonos a capital, pagos extra y edición de moras
- **Reportes**: Generación de reportes financieros y de pagos por fechas
- **Dashboard**: Visualización de estadísticas, gráficos y resúmenes en tiempo real
- **PWA**: Aplicación web progresiva con soporte offline
- **Responsive**: Diseño adaptativo para móviles y desktop
- **Autenticación**: Sistema seguro con JWT y recuperación de contraseña

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18**: Framework principal para la interfaz de usuario
- **Vite**: Herramienta de desarrollo rápida y moderna
- **Tailwind CSS**: Framework de estilos utilitario
- **React Router**: Navegación y enrutamiento
- **Chart.js**: Gráficos y visualizaciones
- **FontAwesome**: Iconos vectoriales
- **AOS**: Animaciones de scroll
- **Quill**: Editor de texto rico
- **Swiper**: Carruseles y sliders

### Desarrollo y Testing
- **Vitest**: Framework de testing moderno
- **Testing Library**: Utilidades para testing de componentes
- **ESLint**: Linting y calidad de código
- **PostCSS**: Procesamiento de CSS
- **PropTypes**: Validación de props en componentes

### PWA y Producción
- **Vite PWA Plugin**: Generación de service workers
- **Workbox**: Estrategias de caching offline
- **Serve**: Servidor estático para producción

### Otras Dependencias
- **JWT Decode**: Decodificación de tokens JWT
- **Date-fns**: Manipulación de fechas
- **Lodash.debounce**: Optimización de funciones
- **Sentry**: Monitoreo de errores en producción

## 📋 Prerrequisitos

- **Node.js**: Versión 23.x (especificado en `engines`)
- **npm** o **yarn**: Gestor de paquetes
- **Git**: Control de versiones
- **Backend API**: Servidor Fintera API corriendo (normalmente en desarrollo local o staging)

## 🚀 Instalación y Ejecución

### 1. Clonar el Repositorio
```bash
git clone https://github.com/sjperalta/FinteraUI.git
cd FinteraUI
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:
```env
VITE_API_URL=http://localhost:3001/api/v1
VITE_APP_ENV=development
```

### 4. Ejecutar en Modo Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`

### 5. Construir para Producción
```bash
npm run build
```

### 6. Vista Previa de Producción
```bash
npm run preview
```

### 7. Ejecutar Tests
```bash
npm test
```

### 8. Linting
```bash
npm run lint
```

## 📁 Estructura del Proyecto

```
FinteraUI/
├── public/                 # Archivos estáticos
│   ├── apple-touch-icon-180x180.png
│   ├── favicon.ico
│   ├── logo.png
│   └── ...
├── src/
│   ├── assets/            # Recursos (CSS, imágenes, fuentes)
│   │   ├── css/
│   │   ├── images/
│   │   └── webfonts/
│   ├── component/         # Componentes reutilizables
│   │   ├── auth/         # Componentes de autenticación
│   │   ├── button/       # Botones personalizados
│   │   ├── chart/        # Gráficos y visualizaciones
│   │   ├── contracts/    # Componentes de contratos
│   │   ├── forms/        # Formularios
│   │   └── ...
│   ├── context/          # Contextos de React (Auth, etc.)
│   ├── pages/            # Páginas principales
│   │   ├── dashboard/
│   │   ├── projects/
│   │   ├── contracts/
│   │   └── ...
│   ├── utils/            # Utilidades y helpers
│   ├── App.jsx           # Componente principal
│   ├── main.jsx          # Punto de entrada
│   └── Router.jsx        # Configuración de rutas
├── config.js             # Configuración de API
├── auth.js               # Utilidades de autenticación
├── index.css             # Estilos globales
├── package.json          # Dependencias y scripts
├── vite.config.js        # Configuración de Vite
├── tailwind.config.js    # Configuración de Tailwind
├── postcss.config.js     # Configuración de PostCSS
├── Procfile              # Configuración para Heroku
└── qa-document.md        # Documento de pruebas QA
```

## 🔄 Flujo de Trabajo de Desarrollo

### 1. Ramas y Versionado
- **main**: Rama principal de producción
- **develop**: Rama de desarrollo con últimas features
- **feature/***: Ramas para nuevas funcionalidades
- **bugfix/***: Ramas para corrección de bugs
- **hotfix/***: Ramas para correcciones urgentes en producción

### 2. Proceso de Desarrollo
1. **Crear rama**: `git checkout -b feature/nueva-funcionalidad`
2. **Desarrollar**: Implementar cambios siguiendo las guías de código
3. **Testing**: Ejecutar tests locales y QA
4. **Commit**: Mensajes descriptivos siguiendo conventional commits
5. **Pull Request**: Crear PR hacia develop con descripción detallada
6. **Code Review**: Revisión por al menos un desarrollador
7. **Merge**: Integración a develop tras aprobación
8. **Deploy**: Despliegue automático a staging

### 3. Conventional Commits
```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: cambios de formato
refactor: refactorización de código
test: agregar o modificar tests
chore: cambios en herramientas
```

### 4. Code Quality
- **ESLint**: Configurado para React y hooks
- **Prettier**: Formateo automático de código
- **Testing**: Cobertura mínima del 80% con Vitest
- **Type Checking**: Uso de PropTypes para validación

### 5. Testing Strategy
- **Unit Tests**: Componentes individuales con Testing Library
- **Integration Tests**: Flujos completos de usuario
- **E2E Tests**: Con Playwright (planeado)
- **QA Manual**: Escenarios documentados en `qa-document.md`

## 🚀 Despliegue

### Railway (Producción)
1. Push a rama main
2. Railway detecta cambios en el codigo y hace el autodeploy
3. Build optimizado con Vite
4. Servidor estático con `serve`

### Configuración PWA
- Assets generados automáticamente con `@vite-pwa/assets-generator`
- Service worker para caching offline
- Manifest para instalación como app

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

### Guías de Contribución
- Seguir el estilo de código establecido
- Agregar tests para nuevas funcionalidades
- Actualizar documentación según cambios
- Mantener compatibilidad con versiones anteriores

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas:
- Crear issue en GitHub
- Contactar al equipo de desarrollo
- Revisar documentación en `qa-document.md`

## 🔄 Versiones

- **v1.0.0**: Versión inicial con funcionalidades básicas
- Próximas versiones: Mejoras en UX, nuevos reportes, integración con APIs externas

---

Desarrollado con ❤️ por el equipo de Fintera
