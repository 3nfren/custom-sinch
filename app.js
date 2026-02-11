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
// Configuración de seguridad ajustada para Journey Builder
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", "https://*.exacttarget.com", "https://*.marketingcloudapps.com"],
        // Añadimos 'unsafe-inline' y 'unsafe-eval' porque RequireJS y Postmonger los necesitan
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://*.exacttarget.com", "https://*.marketingcloudapps.com", "https://*.salesforce.com"],
        // Ampliamos los ancestros para cubrir todos los posibles stacks de Salesforce
        frameAncestors: [
          "'self'",
          "https://*.exacttarget.com",
          "https://*.marketingcloudapps.com",
          "https://*.salesforce.com",
          "https://*.force.com",
          "https://*.sfmc-stack.com"
        ],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://*.northamerica-south1.run.app", "https://*.exacttarget.com"],
      },
    },
    noSniff: true,
    frameguard: false, // Necesario para que frameAncestors funcione
  })
);
// Respaldo para navegadores antiguos: permite que MC embeba la app
// Respaldo para navegadores antiguos: permite que MC embeba la app


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