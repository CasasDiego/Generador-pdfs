# Configuración de MongoDB Atlas

## Pasos para Configurar MongoDB Atlas (GRATIS)

### 1. Crear Cuenta en MongoDB Atlas
- Ve a: https://www.mongodb.com/cloud/atlas/register
- Regístrate con tu email (gratis)

### 2. Crear un Cluster Gratuito
- Click en "Build a Database"
- Selecciona "M0 FREE" (512 MB gratis)
- Elige región más cercana (ej: AWS / N. Virginia)
- Click "Create"

### 3. Crear Usuario de Base de Datos
- Te pedirá crear un usuario
- Username: `admin` (o el que prefieras)
- Password: Genera una contraseña segura (guárdala)
- Click "Create User"

### 4. Configurar Acceso desde Cualquier IP
- En "Network Access" → "Add IP Address"
- Click "Allow Access from Anywhere" (0.0.0.0/0)
- Click "Confirm"

### 5. Obtener Connection String
- Ve a "Database" → Click "Connect"
- Selecciona "Connect your application"
- Copia el connection string, se ve así:
  ```
  mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
  ```

### 6. Configurar en tu Proyecto
- Abre el archivo `.env.local`
- Reemplaza `<username>` con tu usuario
- Reemplaza `<password>` con tu contraseña
- Reemplaza `<cluster>` con el nombre de tu cluster

Ejemplo:
```
MONGODB_URI=mongodb+srv://admin:MiPassword123@cluster0.abc123.mongodb.net/pdf-generator?retryWrites=true&w=majority
```

### 7. Reiniciar Servidor
```bash
npm run dev
```

## ✅ Listo
- Los logs se guardarán permanentemente en MongoDB
- Los usuarios se guardarán permanentemente en MongoDB
- Si MongoDB falla, el sistema usa usuarios de respaldo (admin/usuario)

## Para Vercel (Producción)
1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Añade: `MONGODB_URI` con tu connection string
4. Redeploy el proyecto

## Usuarios por Defecto
La primera vez que conectes a MongoDB, se crearán automáticamente:
- **admin** / admin123 (Administrador)
- **usuario** / user123 (Usuario normal)

## Sistema de Respaldo
Si MongoDB no está disponible:
- ✅ Puedes hacer login con admin/usuario
- ❌ No puedes crear nuevos usuarios
- ❌ No puedes cambiar contraseñas
- ❌ No se guardan logs

