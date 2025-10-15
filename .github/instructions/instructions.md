---
applyTo: '**'
---

# Scripts

- En caso de ser necesario crear scripts, me preguntarás primero y si te doy el ok para crearlo los crearás en una carpeta scripts en el root del proyecto.

# Documentación

- Toda la documentacion que sea necesario crear irpa en un único Archivo README.md en la raíz del proyecto para tenerla centralizada.

# Base de datos

- La base de datos de este proyecto es **Postgres** y se encuentra defuinida en el docker-compose.yaml con el nombre de **ccbl_db**
  -Las credenciales de la base d edatos se encuentran en el archivo .env de la raíz del proyecto.
  siempre que neceistes hacer consultas las harás al contenedor usando **docker compose exec ccbl_db psql -U ccbl -d ccbl**
