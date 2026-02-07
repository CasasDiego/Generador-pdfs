# Generador Masivo de PDFs - MVP

Plataforma web para generar múltiples PDFs personalizados a partir de un archivo Excel y una plantilla PDF.

## Características

- ✅ Carga de archivo Excel (.xlsx) con lista de nombres
- ✅ Carga de plantilla PDF personalizable
- ✅ Generación automática de PDFs individuales
- ✅ Reemplazo de nombres en posición fija
- ✅ Ajuste automático del tamaño de fuente
- ✅ Descarga de todos los PDFs en un archivo ZIP
- ✅ Nombres de archivo correlativos: "001 - NOMBRE.pdf"
- ✅ Soporte para 1-1000 registros

## Tecnologías

- **Frontend**: Next.js 14 (App Router) + React + TypeScript
- **Backend**: Next.js API Routes (Node.js)
- **Librerías**:
  - `xlsx`: Lectura de archivos Excel
  - `pdf-lib`: Manipulación de PDFs
  - `jszip`: Compresión de archivos

## Requisitos Previos

- Node.js 18 o superior
- npm o yarn

## Instalación

1. Navega a la carpeta del proyecto:
```bash
cd pdf-generator-mvp
```

2. Instala las dependencias:
```bash
npm install
```

## Ejecución en Local

1. Inicia el servidor de desarrollo:
```bash
npm run dev
```

2. Abre tu navegador en:
```
http://localhost:3000
```

## Uso

1. **Prepara tu archivo Excel**:
   - Formato: `.xlsx`
   - Los nombres deben estar en la primera columna
   - Puede contener entre 1 y 1000 registros

2. **Prepara tu plantilla PDF**:
   - Cualquier PDF puede ser usado como plantilla
   - El nombre se insertará en la posición configurada (por defecto: centro de la página)

3. **Genera los PDFs**:
   - Sube el archivo Excel
   - Sube la plantilla PDF
   - Haz clic en "Generar ZIP"
   - Espera a que se procesen los archivos
   - El ZIP se descargará automáticamente

## Configuración

Para ajustar la posición y formato del nombre en el PDF, edita las constantes en:
`src/app/api/generate/route.ts`

```typescript
const NAME_CONFIG = {
  x: 300,           // Posición horizontal (desde la izquierda)
  y: 400,           // Posición vertical (desde abajo)
  width: 300,       // Ancho del área del nombre
  height: 50,       // Alto del área del nombre
  maxFontSize: 24,  // Tamaño máximo de fuente
  minFontSize: 12,  // Tamaño mínimo de fuente
};
```

## Estructura del Proyecto

```
pdf-generator-mvp/
├── src/
│   └── app/
│       ├── api/
│       │   └── generate/
│       │       └── route.ts      # API endpoint para generar PDFs
│       ├── layout.tsx             # Layout principal
│       └── page.tsx               # Página principal con formulario
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
```

## Limitaciones del MVP

- No hay autenticación de usuarios
- No hay persistencia de datos (todo en memoria)
- Límite de 1000 registros por procesamiento
- La posición del nombre es fija (configurable en código)
- Solo soporta archivos .xlsx (no .xls)

## Producción

Para compilar para producción:

```bash
npm run build
npm start
```

## Notas Técnicas

- Los archivos se procesan completamente en memoria
- El tamaño de fuente se ajusta automáticamente si el nombre es muy largo
- Se dibuja un rectángulo blanco sobre el área del nombre antes de escribir
- Los PDFs mantienen todo el contenido original excepto el área del nombre
- El orden de los PDFs en el ZIP respeta el orden del Excel

## Solución de Problemas

**Error: "No se encontraron nombres en el Excel"**
- Verifica que la primera columna contenga los nombres
- Asegúrate de que no esté vacía

**Error: "El Excel contiene más de 1000 registros"**
- Divide tu archivo Excel en lotes más pequeños

**El nombre no aparece en la posición correcta**
- Ajusta las coordenadas X e Y en NAME_CONFIG
- Las coordenadas PDF empiezan desde la esquina inferior izquierda
