'use strict';

const util = require('util');
const Path = require('path');
const JWT = require(Path.join(__dirname, '..', 'lib', 'jwtDecoder.js'));
require('dotenv').config();

/**
 * Formatea los logs para que sean visibles en la consola de Google Cloud
 */
function googleConsoleLog(title, data, type = 'INFO') {
    const icon = type === 'ERROR' ? "❌" : "🔹";
    console.log(`\n=== ${icon} ${title.toUpperCase()} ===`);
    if (data) console.log(typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
    console.log(`==========================\n`);
}

/**
 * Procesa la respuesta final inyectando los logs de depuración
 */
function sendDebugResponse(res, statusCode, message, debugTrace) {
    return res.status(statusCode).json({
        status: statusCode === 200 ? "success" : "error",
        message: message,
        debug: debugTrace 
    });
}


exports.edit = function (req, res) {
    googleConsoleLog("Endpoint: Edit", req.body);
    res.status(200).send('Edit');
};

exports.save = function (req, res) {
    googleConsoleLog("Endpoint: Save", req.body);
    res.status(200).send('Save');
};

exports.publish = function (req, res) {
    googleConsoleLog("Endpoint: Publish", req.body);
    res.status(200).send('Publish');
};

exports.validate = function (req, res) {
    googleConsoleLog("Endpoint: Validate", req.body);
    res.status(200).json({ message: "Validation successful" });
};


exports.execute = function (req, res) {
    // Objeto de rastro que viajará en la respuesta HTTP
    let trace = {
        timestamp: new Date().toISOString(),
        step: "Iniciando Execute",
        env_check: {
            url_present: !!process.env.WS_URL,
            token_present: !!process.env.TOKEN,
            secret_present: !!process.env.jwtSecret
        },
        request_metadata: {
            method: req.method,
            ip: req.ip || req.connection.remoteAddress
        }
    };

    googleConsoleLog("🚀 EXECUTE - Petición Recibida", trace);

    // 1. Decodificar JWT
    JWT(req.body, process.env.jwtSecret, (err, decoded) => {
        if (err) {
            trace.error = "Fallo en decodificación JWT: " + err.message;
            googleConsoleLog("Error JWT", err, 'ERROR');
            return sendDebugResponse(res, 401, "No autorizado", trace);
        }

        trace.step = "JWT Decodificado";
        
        if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {
            const args = decoded.inArguments[0];
            trace.arguments_received = args;

            // 2. Preparar variables y Payload
            const finalimageLink = args.imageLink || args.DEimagelink;
            
            const bodyParameters = [
                args.DEvariable1, args.DEvariable2, args.DEvariable3, args.DEvariable4, args.DEvariable5,
                args.DEvariable6, args.DEvariable7, args.DEvariable8, args.DEvariable9, args.DEvariable10
            ].filter(v => {
                if (!v) return false;
                const s = String(v).trim();
                return s !== "" && s !== "{{}}" && s !== "{}";
            });

            const hasImage = args.imageFormat && finalimageLink && 
                String(args.imageFormat).trim() !== "" && 
                String(finalimageLink).trim() !== "" &&
                String(finalimageLink).trim() !== "{{}}";

            let payload = {
                destinations: [{ destination: args.telefono }],
                message: {
                    template: {
                        namespace: args.lineaRemitente,
                        elementName: args.plantilla?.trim(),
                        languagePolicy: "DETERMINISTIC",
                        languageCode: "ES"
                    }
                }
            };

            if (hasImage) {
                payload.message.template.header = {
                    image: { type: args.imageFormat, url: finalimageLink }
                };
            }

            if (bodyParameters.length > 0) {
                payload.message.template.bodyParameters = bodyParameters;
            }

            trace.payload_to_sinch = payload;
            googleConsoleLog("📤 Payload generado", payload);

            // 3. Envío a Sinch
            fetch(process.env.WS_URL, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: { 
                    'UserName': process.env.USERNAME, 
                    'AuthenticationToken': process.env.TOKEN,
                    'Content-Type': 'application/json; charset=utf-8',
                    'Accept': 'application/json'
                },
            })
            .then(async (response) => {
                const sinchData = await response.json();
                trace.step = "Respuesta de Sinch recibida";
                trace.sinch_status = response.status;
                trace.sinch_response_body = sinchData;

                googleConsoleLog("✅ Éxito Sinch", { status: response.status, data: sinchData });

                return sendDebugResponse(res, 200, "Procesado correctamente", trace);
            })
            .catch(error => {
                trace.error = "Error en fetch a Sinch: " + error.message;
                googleConsoleLog("❌ Error Fetch", error, 'ERROR');
                return sendDebugResponse(res, 500, "Error de conexión con Sinch", trace);
            });

        } else {
            trace.error = "inArguments no encontrados o mal estructurados";
            googleConsoleLog("Error inArguments", decoded, 'ERROR');
            return sendDebugResponse(res, 400, "Estructura de datos inválida", trace);
        }
    });
};