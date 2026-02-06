define(["postmonger"], function (Postmonger) {
    "use strict";

    var connection = new Postmonger.Session();
    var payload = {};
    // SOLUCIÓN 1: Definir los IDs que esperas procesar
    var fieldIds = [
        'linearemitente', 'plantilla', 'imageFormat', 'imageLink', 
        'DEimagelink', 'DEvariable1', 'DEvariable2', 'DEvariable3', 
        'DEvariable4', 'DEvariable5', 'DEvariable6', 'DEvariable7', 
        'DEvariable8', 'DEvariable9', 'DEvariable10'
    ];

    $(window).ready(onRender);

    connection.on("initActivity", initialize);
    connection.on("clickedNext", save);

    function onRender() {
        connection.trigger("ready");
    }

    function initialize(data) {
        console.log("INIT PAYLOAD:", data);
        if (data) {
            payload = data;
        }

        connection.trigger('requestSchema');
        
        connection.on('requestedSchema', function(data) {
            const schema = data['schema'];
            for (var i = 0; i < schema.length; i++) {
                let option = $('<option></option>')
                    .attr('value', schema[i].key)
                    .text(schema[i].name);

                // Llenamos todos los selects con los campos de la DE
                $('.de-select').append(option); // Tip: usa una clase en HTML para no repetir IDs
            }
        });

        // Verificamos si existen argumentos previos
        var hasInArguments = Boolean(
            payload["arguments"] &&
            payload["arguments"].execute &&
            payload["arguments"].execute.inArguments &&
            payload["arguments"].execute.inArguments.length > 0
        );

        var inArguments = hasInArguments ? payload["arguments"].execute.inArguments : [{}];

        // Llenar campos con valores guardados anteriormente
        $.each(inArguments[0], function (key, val) {
            if (fieldIds.includes(key)) {
                $(`#${key}`).val(val);
            }
        });

        connection.trigger('updateButton', {
            button: 'next',
            text: 'done',
            visible: true
        });
    }

    function save() {
        // Obtenemos valores de la interfaz
        var lineaRemitente = $('#linearemitente').val();
        var plantilla = $('#plantilla').val();
        
        // SOLUCIÓN 2: Asegurar la estructura del payload antes de asignar
        if (!payload["arguments"]) payload["arguments"] = {};
        if (!payload["arguments"].execute) payload["arguments"].execute = {};

        payload["arguments"].execute.inArguments = [{
             "email": "{{InteractionDefaults.Email}}",
             "telefono": "{{InteractionDefaults.MobileNumber}}",
             "lineaRemitente": lineaRemitente,
             "plantilla": plantilla,
             "imageFormat": $('#imageFormat').val(),
             "imageLink": $('#imageLink').val(),
             "DEimagelink": `{{${$('#DEimagelink').val()}}}`,
             "DEvariable1": `{{${$('#DEvariable1').val()}}}`,
             "DEvariable2": `{{${$('#DEvariable2').val()}}}`,
             "DEvariable3": `{{${$('#DEvariable3').val()}}}`,
             "DEvariable4": `{{${$('#DEvariable4').val()}}}`,
             "DEvariable5": `{{${$('#DEvariable5').val()}}}`,
             "DEvariable6": `{{${$('#DEvariable6').val()}}}`,
             "DEvariable7": `{{${$('#DEvariable7').val()}}}`,
             "DEvariable8": `{{${$('#DEvariable8').val()}}}`,
             "DEvariable9": `{{${$('#DEvariable9').val()}}}`,
             "DEvariable10": `{{${$('#DEvariable10').val()}}}` // Corregido el ID aquí
        }];

        payload["metaData"].isConfigured = true;

        console.log('Final Payload to Save:', payload);

        // Esto es lo que dispara el POST a /journeybuilder/save en tu servidor
        connection.trigger("updateActivity", payload);
    }
});