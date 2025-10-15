#!/bin/bash

# Script para restaurar backup de la base de datos PostgreSQL
# Uso: ./scripts/restore-database.sh <archivo_backup>

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

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 <archivo_backup>"
    echo ""
    echo "Opciones:"
    echo "  <archivo_backup>    Nombre del archivo de backup (con o sin extensión .gz/.sql)"
    echo "  -h, --help         Mostrar esta ayuda"
    echo "  -l, --list         Listar backups disponibles"
    echo ""
    echo "Ejemplos:"
    echo "  $0 backup_20241015_143022"
    echo "  $0 backup_20241015_143022.sql"
    echo "  $0 backup_20241015_143022.sql.gz"
    echo "  $0 -l"
}

# Función para listar backups
list_backups() {
    print_info "Backups disponibles en la carpeta 'backups/':"
    if ls backups/*.{sql,gz} 1> /dev/null 2>&1; then
        ls -lah backups/ | grep -E "\.(sql|gz)$" | awk '{print "  " $9 " (" $5 " - " $6 " " $7 ")"}'
    else
        print_warning "No se encontraron archivos de backup"
    fi
}

# Verificar argumentos
if [[ $# -eq 0 ]]; then
    print_error "Se requiere especificar el archivo de backup"
    show_help
    exit 1
fi

# Manejar opciones
case "$1" in
    -h|--help)
        show_help
        exit 0
        ;;
    -l|--list)
        list_backups
        exit 0
        ;;
esac

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

# Buscar archivo de backup
BACKUP_INPUT="$1"
BACKUP_FILE=""

# Buscar el archivo con diferentes extensiones
for ext in "" ".sql" ".sql.gz"; do
    if [[ -f "backups/${BACKUP_INPUT}${ext}" ]]; then
        BACKUP_FILE="backups/${BACKUP_INPUT}${ext}"
        break
    fi
done

if [[ -z "$BACKUP_FILE" ]]; then
    print_error "Archivo de backup no encontrado: ${BACKUP_INPUT}"
    print_info "Archivos disponibles:"
    list_backups
    exit 1
fi

print_info "Iniciando proceso de restauración de la base de datos..."
print_info "Base de datos: ${DB_NAME}"
print_info "Contenedor: ${DB_CONTAINER}"
print_info "Archivo de backup: ${BACKUP_FILE}"

# Verificar si el contenedor está corriendo
if ! docker ps | grep -q "$DB_CONTAINER"; then
    print_warning "El contenedor de base de datos no está corriendo. Intentando iniciarlo..."
    docker-compose up -d db
    
    # Esperar a que la base de datos esté lista
    print_info "Esperando a que la base de datos esté ready..."
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

# Mostrar advertencia sobre la restauración
print_warning "¡ADVERTENCIA!"
print_warning "Esta operación eliminará TODOS los datos actuales de la base de datos"
print_warning "y los reemplazará con los datos del backup."
print_warning ""
read -p "¿Estás seguro de que quieres continuar? (escribe 'SI' para confirmar): " confirmation

if [[ "$confirmation" != "SI" ]]; then
    print_info "Operación cancelada por el usuario"
    exit 0
fi

# Determinar si el archivo está comprimido
IS_COMPRESSED=false
if [[ "$BACKUP_FILE" == *.gz ]]; then
    IS_COMPRESSED=true
fi

# Crear backup actual antes de restaurar
print_info "Creando backup de seguridad de los datos actuales..."
SAFETY_BACKUP="backups/safety_backup_$(date +"%Y%m%d_%H%M%S").sql"
if docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" --clean --if-exists > "$SAFETY_BACKUP" 2>/dev/null; then
    print_success "Backup de seguridad creado: ${SAFETY_BACKUP}"
else
    print_warning "No se pudo crear backup de seguridad, pero continuando..."
fi

# Restaurar la base de datos
print_info "Restaurando base de datos desde backup..."

if [[ "$IS_COMPRESSED" == true ]]; then
    # Archivo comprimido
    if zcat "$BACKUP_FILE" | docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; then
        print_success "Base de datos restaurada exitosamente desde archivo comprimido"
    else
        print_error "Error al restaurar la base de datos desde archivo comprimido"
        if [[ -f "$SAFETY_BACKUP" ]]; then
            print_info "Restaurando backup de seguridad..."
            cat "$SAFETY_BACKUP" | docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1
        fi
        exit 1
    fi
else
    # Archivo no comprimido
    if cat "$BACKUP_FILE" | docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; then
        print_success "Base de datos restaurada exitosamente"
    else
        print_error "Error al restaurar la base de datos"
        if [[ -f "$SAFETY_BACKUP" ]]; then
            print_info "Restaurando backup de seguridad..."
            cat "$SAFETY_BACKUP" | docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1
        fi
        exit 1
    fi
fi

# Verificar la restauración
print_info "Verificando la restauración..."

# Contar tablas
TABLES_COUNT=$(docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')

if [[ -n "$TABLES_COUNT" && "$TABLES_COUNT" -gt 0 ]]; then
    print_success "Verificación exitosa: ${TABLES_COUNT} tablas encontradas"
    
    # Mostrar algunas estadísticas básicas
    print_info "Estadísticas de la base de datos restaurada:"
    
    # Intentar mostrar conteo de registros de tablas principales
    for table in images image_variants users; do
        COUNT=$(docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | tr -d ' ')
        if [[ -n "$COUNT" ]]; then
            print_info "  - $table: $COUNT registros"
        fi
    done
else
    print_warning "No se pudieron verificar las tablas, pero la restauración parece haber completado"
fi

# Limpiar backup de seguridad si todo salió bien
if [[ -f "$SAFETY_BACKUP" ]]; then
    print_info "¿Desea eliminar el backup de seguridad creado? (${SAFETY_BACKUP})"
    read -p "Escriba 'si' para eliminar: " delete_safety
    if [[ "$delete_safety" == "si" ]]; then
        rm "$SAFETY_BACKUP"
        print_success "Backup de seguridad eliminado"
    else
        print_info "Backup de seguridad conservado en: ${SAFETY_BACKUP}"
    fi
fi

print_success "Proceso de restauración completado"
print_info "La base de datos ha sido restaurada desde: ${BACKUP_FILE}"