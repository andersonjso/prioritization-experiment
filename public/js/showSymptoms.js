/*function showSymptoms(data) {
    var container = $("#divSymptoms");

    container.empty();
    container.append(addSymptoms(data));

    //coloca o botão de filtro no estado original
    $("#buttonSelectSymptosm").text("Deselecionar todos");
}

function addSymptoms(data) {    
    var append = "";
    
    syndrome = data.class.syndrome;

    for(i = 0; i < syndrome.length; i++){
        append += "<input type='checkbox' id='" + syndrome[i].value +  "' class='symptomCheckboxes' checked='true' ><label> " + syndrome[i].value + "</label><br>";
    }

    return append;
}*/

function changeLabelButton(elem) {
    
    var value;
    if (elem.value === "Deselecionar todos"){
        elem.value = "Selecionar todos";
        value = false;
    }else{
        elem.value = "Deselecionar todos";
        value = true;
    }
    

    checkBoxes = $(".symptomCheckboxes");

    for(i = 0; i < checkBoxes.length; i++){
        checkBoxes[i].checked = value;
    }
     
}

function hideSymptomBox(params) {
    d3.select("#symptombox").style("opacity", 0);
}

function changeSymptomsCheckedAttribute(activatedSymptoms){
    checkBoxes = $(".symptomCheckboxes");

    for(i = 0; i < checkBoxes.length; i++){
        checkBoxes[i].checked = false;    
        for(j = 0; j < activatedSymptoms.length; j++){
            if(checkBoxes[i].id == activatedSymptoms[j]){
                checkBoxes[i].checked = true;
                break;
            }
        }
        
    }
    
}
