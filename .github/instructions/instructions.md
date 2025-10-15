---
applyTo: '**'
---

# Instrucciones para el desarrollo del proyecto CCLB-imagenes-back

- Esta app es el backend que se usará en conjunto con un front en react para mostrar imagenes de un banco de imagenes.
- La app debe funcionar a modo de CMS donde el usuario ADMIN pueda subir imagenes y gestionarlas y el usuario normal
  pueda ver las imagenes servidas.
- El usuario admin también podrá editar contenido del footer, header y home mediante modsuilos que se realziarán más adelante.

## Estructura main del proyecto

- En la carpeta prisma/schema se encuentran los modelos de la base de datos.
- El schema de images tiene toda la metadata de las imagenes.
- El schema de imageVariants tiene una relación N a 1 con images y guarda las variantes de las imágenes (miniaturas, etc)
  -Deberemos diosponibilizar una carpeta publica de imagenes donde se guarden las imagenes subidas y se sirvan.

### Gestión de imagenes

- Las imágenes deberán tener un endpoint que use multer para subir las imágenes a la carpeta pública y guardar la metadata en la base de datos.
- Quiero usar la librería sharp para generar miniaturas de las imágenes subidas y guardarlas en la misma carpeta pública.
- Luego deben guardarse las URLs de las imágenes y sus miniaturas en la base de datos.
- Debe haber endpoints para listar, obtener, actualizar y eliminar imágenes.

# Scripts

- En caso de ser necesario crear scripts, me preguntarás primero y si te doy el ok para crearlo los crearás en una carpeta scripts en el root del proyecto.

# Documentación

- Toda la documentacion que sea necesario crear irpa en un único Archivo README.md en la raíz del proyecto para tenerla centralizada.

# Base de datos

- La base de datos de este proyecto es **Postgres** y se encuentra defuinida en el docker-compose.yaml con el nombre de **ccbl_db**
  -Las credenciales de la base d edatos se encuentran en el archivo .env de la raíz del proyecto.
  siempre que neceistes hacer consultas las harás al contenedor usando **docker compose exec ccbl_db psql -U ccbl -d ccbl**

# Prisma

- estamos trabajando en una modealidad en la que dentro de la carpeta priosma/schema se encuentran los modelos todos en diferentes archivos indiciduales.
- por esta razón no hay un archivo schema.prisma en la raíz de la carpeta prisma.
