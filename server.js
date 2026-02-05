'use strict';

const app = require('./app'); // Importa tu app.js
const port = process.env.PORT || 8080; // Cloud Run usa el 8080 por defecto

app.listen(port, () => {
  console.log(`🚀 Servidor listo y escuchando en el puerto ${port}`);
});