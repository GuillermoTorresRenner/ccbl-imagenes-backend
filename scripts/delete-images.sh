#!/bin/bash

# Script para eliminar todas las imágenes y registros de la base de datos
# Mantiene los archivos .gitkeep

echo "🗑️  Eliminando todas las imágenes del sistema..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes con colores
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar que estamos en el directorio correcto
if [[ ! -f "package.json" ]]; then
    log_error "Este script debe ejecutarse desde la raíz del proyecto (donde está package.json)"
    exit 1
fi

# Verificar que existen las carpetas de imágenes
if [[ ! -d "public/images" ]]; then
    log_warning "No existe la carpeta public/images"
    exit 0
fi

log_info "Eliminando archivos de imágenes (manteniendo .gitkeep)..."

# Eliminar archivos de thumbnails (excepto .gitkeep)
if [[ -d "public/images/thumbnails" ]]; then
    find public/images/thumbnails -type f ! -name ".gitkeep" -delete
    log_success "Archivos eliminados de public/images/thumbnails/"
fi

# Eliminar archivos de medium (excepto .gitkeep)
if [[ -d "public/images/medium" ]]; then
    find public/images/medium -type f ! -name ".gitkeep" -delete
    log_success "Archivos eliminados de public/images/medium/"
fi

# Eliminar archivos de full (excepto .gitkeep)
if [[ -d "public/images/full" ]]; then
    find public/images/full -type f ! -name ".gitkeep" -delete
    log_success "Archivos eliminados de public/images/full/"
fi

log_info "Eliminando registros de la base de datos..."

# Cargar variables de entorno
if [[ -f ".env" ]]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    log_error "No se encontró el archivo .env"
    exit 1
fi

# Verificar que las variables necesarias estén definidas
if [[ -z "$POSTGRES_USER" || -z "$POSTGRES_DB" ]]; then
    log_error "Variables de entorno POSTGRES_USER o POSTGRES_DB no están definidas"
    exit 1
fi

# Verificar si el contenedor de base de datos está corriendo
if ! docker compose ps db | grep -q "Up"; then
    log_warning "El contenedor de base de datos no está corriendo. Iniciándolo..."
    docker compose up db -d
    sleep 5
fi

# Ejecutar las consultas SQL para eliminar registros
log_info "Eliminando registros de image_variants..."
docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "DELETE FROM image_variants;" 2>/dev/null
if [[ $? -eq 0 ]]; then
    log_success "Registros eliminados de image_variants"
else
    log_error "Error al eliminar registros de image_variants"
fi

log_info "Eliminando registros de images..."
docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "DELETE FROM images;" 2>/dev/null
if [[ $? -eq 0 ]]; then
    log_success "Registros eliminados de images"
else
    log_error "Error al eliminar registros de images"
fi

# Mostrar conteo final
log_info "Verificando limpieza..."
IMAGES_COUNT=$(docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c "SELECT COUNT(*) FROM images;" 2>/dev/null | xargs)
VARIANTS_COUNT=$(docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c "SELECT COUNT(*) FROM image_variants;" 2>/dev/null | xargs)

log_info "Registros restantes:"
echo "  - Images: $IMAGES_COUNT"
echo "  - Image variants: $VARIANTS_COUNT"

if [[ "$IMAGES_COUNT" == "0" && "$VARIANTS_COUNT" == "0" ]]; then
    log_success "🎉 Todas las imágenes y registros han sido eliminados exitosamente"
else
    log_warning "Algunos registros no pudieron ser eliminados"
fi

echo ""
log_info "📁 Los archivos .gitkeep se mantuvieron intactos"
log_info "🔄 Puedes volver a subir imágenes normalmente"