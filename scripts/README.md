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

### ⚠️ Advertencia

**Este script elimina TODAS las imágenes del sistema de forma permanente.** Úsalo solo cuando necesites limpiar completamente el sistema de imágenes para desarrollo o testing.