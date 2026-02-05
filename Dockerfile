# Usamos Node 18
FROM node:18-slim

# Creamos la carpeta de la app
WORKDIR /usr/src/app

# Copiamos las dependencias primero (optimiza la cache)
COPY package*.json ./
RUN npm install --production

# Copiamos el resto de los archivos
COPY . .

# Exponemos el puerto
EXPOSE 8080

# ¡IMPORTANTE! Ejecutamos server.js, no app.js
CMD [ "node", "server.js" ]