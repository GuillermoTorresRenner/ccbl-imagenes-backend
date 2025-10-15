# migración de imágenes

- En la carpeta raíz hay una carpeta llamada img_migrations con lo necesario para crear este modulo.
- dentro de la carpeta hay un CSV con las referencias de las imágenes a migrar y una carpeta full con las imágenes separadas en subdirectorios (también referenciados en el csv).
  -sabemos que hay registros huerfanos, es decir que existen regiostros en el csv que tienen imágenes que no existen en la carpeta imagenes.
- El script de migración deberá leer el csv y por cada registro:
- Comprobar si la imagen existe en la carpeta imagenes y su subcarpeta correspondiente.
  generawer un archivo json con la metadata y la referencia de la imagen.
  luego de crear el json deberá usar el endpoint de subida de imágenes para subir la imagen y su metadata.

- Se deberán subir todas las imágenes del json generado
- se deberá genrear un log con las imágenes que no se han podido subir y el motivo en la misma carpeta de img_migrations en una subcarpeta logs
- En base al log se deberá crear un reporte en md en una carpet ade reportes en la misma carpeta de img_migrations
- El script deberá ser ejecutable desde la terminal con node referenciado en el package.json como "migrate:img": "ts-node ./scripts/migrate-images.ts"
