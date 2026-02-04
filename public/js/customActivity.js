define(["postmonger"], function (Postmonger) {
    "use strict";

    var connection = new Postmonger.Session();
    var payload = {};

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
            let attr = schema[i].key;

            // populate select dropdown 
            let option = $('<option></option>')
                .attr('value', schema[i].key)
                .text(schema[i].name);

            $('#DEimagelink').append(option.clone());
            $('#DEvariable1').append(option.clone());
            $('#DEvariable2').append(option.clone());
            $('#DEvariable3').append(option.clone());
            $('#DEvariable4').append(option.clone());
            $('#DEvariable5').append(option.clone());
            $('#DEvariable6').append(option.clone());
            $('#DEvariable7').append(option.clone());
            $('#DEvariable8').append(option.clone());
            $('#DEvariable9').append(option.clone());
            $('#DEvariable10').append(option);

            }
        });

        var hasInArguments = Boolean(
            payload["arguments"] &&
            payload["arguments"].execute &&
            payload["arguments"].execute.inArguments &&
            payload["arguments"].execute.inArguments.length > 0
        );

        var inArguments = hasInArguments ? payload["arguments"].execute.inArguments : {};


        $.each(inArguments, function (index, inArgument) {
        $.each(inArgument, function (key, val) {
            if (fieldIds.includes(key)) {
            $(`#${key}`).val(val);
            }
        });
        });

        connection.trigger('updateButton', {
            button: 'next',
            text: 'done',
            visible: true
        });
    }


    function save() {
        var lineaRemitente = $('#linearemitente').val();
        var plantilla = $('#plantilla').val();
        var imageFormat = $('#imageFormat').val();
        var imageLink = $('#imageLink').val();
        var DEimagelink = $('#DEimagelink').find('option:selected').val();
        var DEvariable1 = $('#DEvariable1').find('option:selected').val();
        var DEvariable2 = $('#DEvariable2').find('option:selected').val();
        var DEvariable3 = $('#DEvariable3').find('option:selected').val();
        var DEvariable4 = $('#DEvariable4').find('option:selected').val();
        var DEvariable5 = $('#DEvariable5').find('option:selected').val();
        var DEvariable6 = $('#DEvariable6').find('option:selected').val();
        var DEvariable7 = $('#DEvariable7').find('option:selected').val();
        var DEvariable8 = $('#DEvariable8').find('option:selected').val();
        var DEvariable9 = $('#DEvariable9').find('option:selected').val();
        var DEvariable10 = $('#DEvariable5').find('option:selected').val();

        payload["arguments"].execute.inArguments = [{
             "email": "{{InteractionDefaults.Email}}",
             "telefono": "{{InteractionDefaults.MobileNumber}}",
             "lineaRemitente": lineaRemitente,
             "plantilla": plantilla,
             "imageFormat": imageFormat,
             "imageLink": imageLink,
             "DEimagelink": `{{${DEimagelink}}}`,
             "DEvariable1": `{{${DEvariable1}}}`,
             "DEvariable2": `{{${DEvariable2}}}`,
             "DEvariable3": `{{${DEvariable3}}}`,
             "DEvariable4": `{{${DEvariable4}}}`,
             "DEvariable5": `{{${DEvariable5}}}`,
             "DEvariable6": `{{${DEvariable6}}}`,
             "DEvariable7": `{{${DEvariable7}}}`,
             "DEvariable8": `{{${DEvariable8}}}`,
             "DEvariable9": `{{${DEvariable9}}}`,
             "DEvariable10": `{{${DEvariable10}}}`
             }];

        payload["metaData"].isConfigured = true;

        console.log('InArguments:',payload["arguments"].execute.inArguments);

        connection.trigger("updateActivity", payload);
    }

});