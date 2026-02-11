'use strict';

var express     = require('express');
var bodyParser  = require('body-parser');
var path        = require('path');
var routes      = require('./routes');
var activity    = require('./routes/activity');
var cors        = require('cors');
const crypto    = require('crypto');
const helmet    = require("helmet"); // Declarada una sola vez aquí

var app = express();
app.disable('x-powered-by');

// Generador de Nonce para scripts e inline styles
app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString('base64');
  next();
});

// Configuración avanzada de seguridad para cumplir con auditoría
app.use(
  helmet({
    // 1. Soluciona: "Falta encabezado X-Content-Type-Options"
    noSniff: true, 
    
    // 2. Soluciona: "Falta de cabecera Anti-Clickjacking"
    // frameguard: false permite que frameAncestors de CSP tome el control
    frameguard: false, 

    // 3. Soluciona: "Cabecera Content Security Policy (CSP) no configurada"
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // Permite scripts de tu server y de Salesforce
        scriptSrc: ["'self'", "'unsafe-inline'", "https://*.exacttarget.com", "https://*.marketingcloudapps.com"],
        // Crucial para que Salesforce pueda embeber tu App
        frameAncestors: [
          "'self'",
          "https://*.exacttarget.com",
          "https://*.marketingcloudapps.com",
          "https://*.salesforce.com",
          "https://*.sfmc-stack.com"
        ],
        // Soluciona el error de "inline style" que vimos en consola
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        // Permite la conexión a tu propia URL de Cloud Run
        connectSrc: ["'self'", "https://*.northamerica-south1.run.app"]
      },
    },
  })
);

// Respaldo para navegadores antiguos (Anti-Clickjacking)
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "ALLOW-FROM https://mc.exacttarget.com");
  next();
});

// Configuración de CORS
const allowlist = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

var corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowlist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origin no permitido por CORS'));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type','Authorization'],
  optionsSuccessStatus: 200 
};

app.use(cors(corsOptions));

// Configuración de Express
app.set('port', process.env.PORT || 3000);
app.use(bodyParser.raw({type: 'application/jwt'}));
app.use(bodyParser.json({type: 'application/json'})); 
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.get('/', routes.index );
app.post('/login', routes.login );
app.post('/logout', routes.logout );

// Custom Activity Routes
app.post('/journeybuilder/save/', activity.save );
app.post('/journeybuilder/validate/', activity.validate );
app.post('/journeybuilder/publish/', activity.publish );
app.post('/journeybuilder/execute/', activity.execute );

app.use((req, res) => {
  res.status(404).send('Not Found');
});

module.exports = app;