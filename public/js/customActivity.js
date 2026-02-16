define(["postmonger"], function (Postmonger) {
    "use strict";

    var connection = new Postmonger.Session();
    var payload = {};
    var fieldIds = [
        'linearemitente', 'plantilla', 'imageFormat', 'imageLink', 
        'DEimagelink', 'DEvariable1', 'DEvariable2', 'DEvariable3', 
        'DEvariable4', 'DEvariable5', 'DEvariable6', 'DEvariable7', 
        'DEvariable8', 'DEvariable9', 'DEvariable10'
    ];
    var variableCount = 0; // Contador para saber qué variable mostrar

    $(window).ready(onRender);

    connection.on("initActivity", initialize);
    connection.on("clickedNext", save);

    function onRender() {
        connection.trigger("ready");

        // --- LÓGICA DE INTERACCIÓN DEL FORMULARIO ---

        // 1. Mostrar/Ocultar opciones de imagen
        $('#hasImage').change(function() {
            if ($(this).is(':checked')) {
                $('#imageOptions').fadeIn();
            } else {
                $('#imageOptions').fadeOut();
                // Limpiamos valores si se oculta
                $('#imageLink, #DEimagelink').val('');
            }
        });

        // 2. Botón "+ Agregar Variable"
        $('#hasVariable').click(function() {
            if (variableCount < 10) {
                variableCount++;
                $(`#variable${variableCount}`).fadeIn();
            } else {
                alert("Máximo 10 variables permitidas");
            }
        });

        // 3. Botones de eliminar (❌)
        $('.delete-btn').click(function() {
            var id = $(this).attr('id').replace('delete', ''); // Obtiene el número
            $(`#variable${id}`).fadeOut();
            $(`#DEvariable${id}`).val(''); // Limpia el select
            // Nota: Aquí podrías ajustar el variableCount si prefieres
        });
    }

    function initialize(data) {
        if (data) {
            payload = data;
        }

        connection.trigger('requestSchema');
        
        connection.on('requestedSchema', function(data) {
            const schema = data['schema'];
            // Llenamos todos los selects que tengan nombres de variables
            $('select[id^="DE"]').empty().append('<option value="">Seleccione una opción</option>');
            
            for (var i = 0; i < schema.length; i++) {
                let option = $('<option></option>')
                    .attr('value', schema[i].key)
                    .text(schema[i].name);
                
                // Aplicar a todos los selectores de variables y el de imagen
                $('#DEimagelink, #DEvariable1, #DEvariable2, #DEvariable3, #DEvariable4, #DEvariable5, #DEvariable6, #DEvariable7, #DEvariable8, #DEvariable9, #DEvariable10').append(option);
            }

            // Después de llenar los selects, cargamos los datos guardados
            loadSavedArguments();
        });

        connection.trigger('updateButton', {
            button: 'next',
            text: 'done',
            visible: true
        });
    }

    function loadSavedArguments() {
        var hasInArguments = Boolean(
            payload["arguments"] &&
            payload["arguments"].execute &&
            payload["arguments"].execute.inArguments &&
            payload["arguments"].execute.inArguments.length > 0
        );

        var inArguments = hasInArguments ? payload["arguments"].execute.inArguments : [{}];
        var args = inArguments[0];

        // Llenar inputs y selects
        $.each(args, function (key, val) {
            if (fieldIds.includes(key)) {
                // Limpiar bigotes {{}} para que el select coincida con el valor
                var cleanVal = val ? val.replace(/{{|}}/g, '').replace('Contact.Attribute.', '') : '';
                $(`#${key}`).val(cleanVal);
                
                // Si la variable tiene valor, mostramos el contenedor
                if (cleanVal && key.startsWith('DEvariable')) {
                    var num = key.replace('DEvariable', '');
                    $(`#variable${num}`).show();
                    if (parseInt(num) > variableCount) variableCount = parseInt(num);
                }
                
                // Si hay algo en imagen, marcamos el checkbox
                if (key === 'DEimagelink' || key === 'imageLink') {
                    if (val) {
                        $('#hasImage').prop('checked', true);
                        $('#imageOptions').show();
                    }
                }
            }
        });
    }

    function save() {
        var lineaRemitente = $('#linearemitente').val();
        var plantilla = $('#plantilla').val();
        
        if (!payload["arguments"]) payload["arguments"] = {};
        if (!payload["arguments"].execute) payload["arguments"].execute = {};
        if (!payload["metaData"]) payload["metaData"] = {};

        payload["arguments"].execute.inArguments = [{
             "email": "{{InteractionDefaults.Email}}",
             "telefono": "{{InteractionDefaults.MobileNumber}}",
             "lineaRemitente": lineaRemitente,
             "plantilla": plantilla,
             "imageFormat": $('#imageFormat').val(),
             "imageLink": $('#imageLink').val(),
             "DEimagelink": $('#DEimagelink').val() ? `{{${$('#DEimagelink').val()}}}` : '',
             "DEvariable1": $('#DEvariable1').val() ? `{{${$('#DEvariable1').val()}}}` : '',
             "DEvariable2": $('#DEvariable2').val() ? `{{${$('#DEvariable2').val()}}}` : '',
             "DEvariable3": $('#DEvariable3').val() ? `{{${$('#DEvariable3').val()}}}` : '',
             "DEvariable4": $('#DEvariable4').val() ? `{{${$('#DEvariable4').val()}}}` : '',
             "DEvariable5": $('#DEvariable5').val() ? `{{${$('#DEvariable5').val()}}}` : '',
             "DEvariable6": $('#DEvariable6').val() ? `{{${$('#DEvariable6').val()}}}` : '',
             "DEvariable7": $('#DEvariable7').val() ? `{{${$('#DEvariable7').val()}}}` : '',
             "DEvariable8": $('#DEvariable8').val() ? `{{${$('#DEvariable8').val()}}}` : '',
             "DEvariable9": $('#DEvariable9').val() ? `{{${$('#DEvariable9').val()}}}` : '',
             "DEvariable10": $('#DEvariable10').val() ? `{{${$('#DEvariable10').val()}}}` : ''
        }];

        payload["metaData"].isConfigured = true;
        connection.trigger("updateActivity", payload);
    }
});