FROM node:18

WORKDIR /app

# Copiar archivos de configuración globales
COPY package*.json ./

# Copiar archivos de configuración del servidor
COPY server/package*.json ./server/

# Instalar dependencias del servidor
WORKDIR /app/server
RUN npm install

# Reconstruir bcrypt para el entorno de Docker
RUN npm rebuild bcrypt --build-from-source

# Volver al directorio raíz
WORKDIR /app

# Copiar el código del servidor
COPY server/ ./server/

# Establecer variables de entorno
ENV NODE_ENV=production
ENV PORT=10000

# Exponer el puerto que usará la aplicación
EXPOSE 10000

# Comando para iniciar el servidor
CMD ["node", "server/server.js"]