#!/bin/bash

# Script para crear backup de la base de datos PostgreSQL
# Uso: ./scripts/backup-database.sh [nombre_opcional]

# Configuración de colores para salida
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con colores
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar que se ejecute desde la raíz del proyecto
if [[ ! -f "package.json" || ! -f "docker-compose.yml" ]]; then
    print_error "Este script debe ejecutarse desde la raíz del proyecto"
    exit 1
fi

# Verificar que existe el archivo .env
if [[ ! -f ".env" ]]; then
    print_error "Archivo .env no encontrado"
    exit 1
fi

# Cargar variables de entorno
source .env

# Verificar variables requeridas
if [[ -z "$POSTGRES_USER" || -z "$POSTGRES_PASSWORD" || -z "$POSTGRES_DB" || -z "$PREFIX" ]]; then
    print_error "Variables de entorno faltantes. Asegúrate de que .env contenga:"
    print_error "POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, PREFIX"
    exit 1
fi

# Configuración de la base de datos
DB_CONTAINER="${PREFIX}_db"
# Extraer host y puerto de DATABASE_URL o usar valores por defecto
if [[ -n "$DATABASE_URL" ]]; then
    DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
else
    DB_HOST="localhost"
    DB_PORT="5434"
fi
DB_USER="$POSTGRES_USER"
DB_PASSWORD="$POSTGRES_PASSWORD"
DB_NAME="$POSTGRES_DB"

# Crear nombre del archivo de backup
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
if [[ -n "$1" ]]; then
    BACKUP_NAME="${1}_${TIMESTAMP}"
else
    BACKUP_NAME="backup_${TIMESTAMP}"
fi
BACKUP_FILE="backups/${BACKUP_NAME}.sql"

print_info "Iniciando proceso de backup de la base de datos..."
print_info "Base de datos: ${DB_NAME}"
print_info "Contenedor: ${DB_CONTAINER}"
print_info "Archivo de backup: ${BACKUP_FILE}"

# Verificar si el contenedor está corriendo
if ! docker ps | grep -q "$DB_CONTAINER"; then
    print_warning "El contenedor de base de datos no está corriendo. Intentando iniciarlo..."
    docker-compose up -d db
    
    # Esperar a que la base de datos esté lista
    print_info "Esperando a que la base de datos esté lista..."
    sleep 5
    
    # Verificar conexión
    for i in {1..30}; do
        if docker exec "$DB_CONTAINER" pg_isready -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; then
            print_success "Base de datos lista"
            break
        fi
        if [[ $i -eq 30 ]]; then
            print_error "Timeout esperando que la base de datos esté lista"
            exit 1
        fi
        sleep 1
    done
fi

# Crear backup usando pg_dump
print_info "Creando backup de la base de datos..."

if docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" --verbose --clean --if-exists > "$BACKUP_FILE" 2>/dev/null; then
    print_success "Backup creado exitosamente: ${BACKUP_FILE}"
    
    # Mostrar información del archivo
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    print_info "Tamaño del backup: ${BACKUP_SIZE}"
    
    # Mostrar estadísticas del backup
    TABLES_COUNT=$(grep -c "CREATE TABLE" "$BACKUP_FILE" 2>/dev/null || echo "0")
    print_info "Tablas incluidas en el backup: ${TABLES_COUNT}"
    
    # Comprimir el backup
    print_info "Comprimiendo backup..."
    gzip "$BACKUP_FILE"
    
    if [[ $? -eq 0 ]]; then
        COMPRESSED_FILE="${BACKUP_FILE}.gz"
        COMPRESSED_SIZE=$(du -h "$COMPRESSED_FILE" | cut -f1)
        print_success "Backup comprimido: ${COMPRESSED_FILE}"
        print_info "Tamaño comprimido: ${COMPRESSED_SIZE}"
    else
        print_warning "No se pudo comprimir el backup, pero el archivo SQL está disponible"
    fi
    
    # Listar backups disponibles
    print_info "Backups disponibles:"
    ls -lah backups/ | grep -E "\.(sql|gz)$" | awk '{print "  " $9 " (" $5 " - " $6 " " $7 ")"}'
    
else
    print_error "Error al crear el backup"
    exit 1
fi

print_success "Proceso de backup completado"