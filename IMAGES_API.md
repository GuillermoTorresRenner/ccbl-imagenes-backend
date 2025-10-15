# 📸 Sistema de Gestión de Imágenes

## Funcionalidades Implementadas

### 🚀 **Subida y Procesamiento de Imágenes**

El sistema permite subir imágenes y automáticamente:

- Convierte las imágenes a formato **WebP** para optimización
- Genera **3 variantes** de cada imagen:
  - **Thumbnail**: 150x150px (recortada)
  - **Medium**: 800px de ancho (proporcional)
  - **Full**: Tamaño original optimizado
- Almacena los archivos en carpetas organizadas
- Guarda metadatos en la base de datos

### 📁 **Estructura de Archivos**

```
public/images/
├── thumbnails/    # Imágenes 150x150px
├── medium/        # Imágenes 800px ancho
└── full/          # Imágenes tamaño original
```

### 🔧 **Endpoints Disponibles**

#### **POST /api/images/upload**

Sube una imagen con metadatos.

**Parámetros:**

- `image` (file): Archivo de imagen (PNG, JPEG, JPG, WebP)
- Metadatos opcionales en el body:
  ```json
  {
    "title": "Título de la imagen",
    "altText": "Texto alternativo",
    "description": "Descripción",
    "notes": "Notas adicionales",
    "people": "Personas en la imagen",
    "year": "Año",
    "decade": "Década",
    "zone": "Zona geográfica",
    "previousData": "Datos previos",
    "patrimonialValue": 5,
    "owner": "Propietario",
    "culturalFund": "Fondo cultural"
  }
  ```

**Respuesta:**

```json
{
  "message": "Imagen subida exitosamente",
  "data": {
    "image": {
      "id": "clxxxxx",
      "title": "Título de la imagen",
      "createdAt": "2025-10-15T17:10:54.000Z"
      // ... otros metadatos
    },
    "variants": [
      {
        "id": "clxxxxx",
        "url": "/public/images/thumbnails/uuid-timestamp.webp",
        "width": 150,
        "height": 150,
        "format": "webp",
        "quality": 80,
        "sizeBytes": 12345
      }
      // ... medium y full
    ]
  }
}
```

#### **GET /api/images**

Obtiene todas las imágenes con sus variantes.

#### **GET /api/images/:id**

Obtiene una imagen específica por ID.

#### **DELETE /api/images/:id**

Elimina una imagen y todos sus archivos asociados.

### 🔒 **Validaciones**

- **Tamaño máximo**: 10MB por archivo
- **Tipos permitidos**: PNG, JPEG, JPG, WebP
- **Nombres únicos**: UUID + timestamp para evitar colisiones

### 🛠 **Tecnologías Utilizadas**

- **Multer**: Manejo de subida de archivos
- **Sharp**: Procesamiento y conversión de imágenes
- **@nestjs/serve-static**: Servir archivos estáticos
- **Prisma**: ORM para base de datos
- **UUID**: Generación de identificadores únicos

### 📋 **Base de Datos**

**Modelo Image:**

- Metadatos principales de la imagen
- Relación uno-a-muchos con ImageVariant

**Modelo ImageVariant:**

- Información de cada variante (thumbnail, medium, full)
- URL, dimensiones, tamaño, calidad, etc.

### 🔧 **Configuración**

El sistema está configurado para:

- Servir archivos estáticos desde `/public`
- Procesar imágenes en memoria (no se almacenan temporalmente)
- Eliminar archivos físicos al borrar registros de BD
- Manejo de errores y rollback automático

### 🚀 **Cómo Probar**

1. Inicia el servidor: `npm run start:dev`
2. Usa un cliente HTTP (Postman, Thunder Client, etc.)
3. Envía POST a `http://localhost:3000/api/images/upload`
4. Adjunta una imagen en el campo `image`
5. Opcionalmente añade metadatos en el body
6. Las imágenes procesadas estarán disponibles en las URLs devueltas

### 📸 **Acceso a Imágenes**

Las imágenes procesadas están disponibles directamente vía HTTP:

- `http://localhost:3000/public/images/thumbnails/uuid-timestamp.webp`
- `http://localhost:3000/public/images/medium/uuid-timestamp.webp`
- `http://localhost:3000/public/images/full/uuid-timestamp.webp`
