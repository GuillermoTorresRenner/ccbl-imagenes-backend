# Dockerfile simple para un proyecto NestJS con Prisma
FROM node:20-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install --production

# Copia el resto del código fuente
COPY . .

# Genera el cliente de Prisma
RUN npx prisma generate

# Expone el puerto (ajusta si tu app usa otro)
EXPOSE 3000

# Comando por defecto para iniciar la app
CMD ["npm", "run", "start:prod"]
