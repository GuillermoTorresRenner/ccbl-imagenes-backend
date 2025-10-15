# Scripts del Proyecto

## delete-images.sh

Script para eliminar **todas** las imágenes del sistema tanto de los archivos físicos como de la base de datos.

### ¿Qué hace?

1. **Elimina archivos físicos:**
   - Borra todas las imágenes de `public/images/thumbnails/`
   - Borra todas las imágenes de `public/images/medium/`
   - Borra todas las imágenes de `public/images/full/`
   - **Mantiene los archivos `.gitkeep`** intactos

2. **Limpia la base de datos:**
   - Elimina todos los registros de la tabla `image_variants`
   - Elimina todos los registros de la tabla `images`
   - Respeta las relaciones de clave foránea (variants primero, luego images)

### Uso

```bash
# Usando npm
npm run delete:img

# O directamente
./scripts/delete-images.sh
```

### Requisitos

- Docker y Docker Compose instalados
- Archivo `.env` configurado con variables de base de datos
- El script debe ejecutarse desde la raíz del proyecto

### Salida

El script proporciona información colorizada sobre el proceso:
- 🔵 Información general
- ✅ Operaciones exitosas
- ⚠️ Advertencias
- ❌ Errores

### Verificaciones de seguridad

- Verifica que se ejecute desde la raíz del proyecto
- Comprueba que existan las variables de entorno necesarias
- Inicia la base de datos automáticamente si no está corriendo
- Muestra conteos finales para confirmar la limpieza

## backup-database.sh

Script para crear backups de la base de datos PostgreSQL.

### ¿Qué hace?

1. **Crea backup completo de la base de datos:**
   - Genera un dump SQL con todos los datos y estructura
   - Usa las credenciales del archivo `.env`
   - Incluye comandos de limpieza (`--clean --if-exists`)

2. **Comprime automáticamente:**
   - Comprime el backup con gzip para ahorrar espacio
   - Mantiene la estructura original si la compresión falla

3. **Gestión inteligente:**
   - Inicia la base de datos automáticamente si no está corriendo
   - Genera nombres únicos con timestamp
   - Permite nombres personalizados para el backup

### Uso

```bash
# Usando npm (backup automático)
npm run db:backup

# Con nombre personalizado
./scripts/backup-database.sh mi_backup_importante

# O directamente
./scripts/backup-database.sh
```

### Salida

Los backups se guardan en la carpeta `backups/` con formato:
- `backup_YYYYMMDD_HHMMSS.sql.gz` (backup automático)
- `nombre_personalizado_YYYYMMDD_HHMMSS.sql.gz` (con nombre)

## restore-database.sh

Script para restaurar backups de la base de datos PostgreSQL.

### ¿Qué hace?

1. **Restaura base de datos desde backup:**
   - Acepta archivos `.sql` o `.sql.gz`
   - Busca automáticamente el archivo en `backups/`
   - Usa las credenciales del archivo `.env`

2. **Medidas de seguridad:**
   - Crea backup de seguridad antes de restaurar
   - Requiere confirmación explícita del usuario
   - Valida la restauración mostrando estadísticas

3. **Gestión de archivos:**
   - Detecta automáticamente si el archivo está comprimido
   - Permite especificar archivo con o sin extensión
   - Lista backups disponibles con `-l`

### Uso

```bash
# Usando npm (requiere especificar archivo)
npm run db:restore backup_20241015_143022

# Listar backups disponibles
./scripts/restore-database.sh -l

# Restaurar archivo específico
./scripts/restore-database.sh backup_20241015_143022

# Con extensión completa
./scripts/restore-database.sh backup_20241015_143022.sql.gz

# Mostrar ayuda
./scripts/restore-database.sh -h
```

### Verificaciones de seguridad

Ambos scripts:
- Verifican que se ejecuten desde la raíz del proyecto
- Comprueban que existan las variables de entorno necesarias
- Extraen host y puerto de `DATABASE_URL` del archivo `.env`
- Inician la base de datos automáticamente si no está corriendo
- Proporcionan información colorizada sobre el proceso

### ⚠️ Advertencia

**Este script elimina TODAS las imágenes del sistema de forma permanente.** Úsalo solo cuando necesites limpiar completamente el sistema de imágenes para desarrollo o testing.