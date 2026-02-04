'use strict';
// Module Dependencies
// -------------------
var express     = require('express');
var bodyParser  = require('body-parser');
var http        = require('http');
var path        = require('path');
var routes      = require('./routes');
var activity    = require('./routes/activity');
var cors = require('cors')
const crypto = require('crypto');
const helmet = require("helmet")

var app = express();
app.disable('x-powered-by');

app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString('base64');
  next();
});

app.use(helmet())
app.use(helmet.noSniff());
app.use(helmet.frameguard({ action: 'SAMEORIGIN' }));

const cspOrigins = (process.env.CSP_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);
  
// Activar CSP explícitamente
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],

        frameAncestors: [
          "https://*.exacttarget.com",
          "https://*.marketingcloudapps.com",
          "https://*.sfmc-stack.com"
        ],

        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://*.exacttarget.com",
          "https://*.marketingcloudapps.com",
          "https://*.sfmc-stack.com"
        ],

        styleSrc: [
          "'self'",
          "'unsafe-inline'"
        ],

        imgSrc: [
          "'self'",
          "data:",
          "https:"
        ],

        connectSrc: [
          "'self'",
          "https://*.exacttarget.com",
          "https://*.marketingcloudapps.com",
          "https://*.sfmc-stack.com"
        ]
      }
    }
  })
);

const allowlist = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);


var corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    return allowlist.includes(origin)
      ? callback(null, true)
      : callback(new Error('Origin no permitido'));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type','Authorization'],
  optionsSuccessStatus: 200 
}

app.use(cors(corsOptions))

// Configure Express
app.set('port', process.env.PORT || 3000);
app.use(bodyParser.raw({type: 'application/jwt'}));
app.use(bodyParser.json({type: 'application/json'})); 
//app.use(bodyParser.urlencoded({ extended: true }));

//app.use(express.methodOverride());
//app.use(express.favicon());

app.use(express.static(path.join(__dirname, 'public')));


// Express in Development Mode
if ('development' == app.get('env')) {
  //app.use(errorhandler());
}

// HubExchange Routes
app.get('/', routes.index );
app.post('/login', routes.login );
app.post('/logout', routes.logout );

// Custom Hello World Activity Routes
app.post('/journeybuilder/save/', activity.save );
app.post('/journeybuilder/validate/', activity.validate );
app.post('/journeybuilder/publish/', activity.publish );
app.post('/journeybuilder/execute/', activity.execute );

// 404 para cualquier ruta no encontrada (mantiene el CSP de helmet)
app.use((req, res) => {
  res.status(404).send('Not Found');
});

// http.createServer(app).listen(app.get('port'), function(){
//   console.log('Express server listening on port ' + app.get('port'));
// });
module.exports = app;