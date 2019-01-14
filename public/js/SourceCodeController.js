angular.module("myApp").controller('sourceCodeCtr', ['$scope','$http', '$routeParams', '$location', '$anchorScroll', function($scope,$http, $routeParams, $location, $anchorScroll) {

    $scope.currentMethod = null;
    $scope.firstPage = false;
    var className = $routeParams.name;

    alert(className);

    $http.get('/convert')
        .then(function (response) {
            //the first item of the list is because I want to receive just one object
            $scope.dataResponse = "file:/Users/andersonjso/Documents/development/prioritization-experiment/public/data/symptoms.json";
            console.log($scope.dataResponse);
        });

    $.getJSON('../data/symptoms.json', function (data) {
        $scope.dataResponse = data[0];
    });

    $scope.sourceCode = "Carregando...";

    fetch('../data/sc/DeviceRepository.java').
        then(res => res.text()).
        then(data => $scope.sourceCode = data);

    function isEmpty(obj) {
        for(var prop in obj) {
            if(obj.hasOwnProperty(prop))
                return false;
        }

        return true;
    }

    function clearLines (startingLine, endingLine){
        for (var i=startingLine; i<=endingLine; i++){
            var currentLine = 'li:nth-child(' +i + ')';
            myEl = angular.element( document.querySelector(currentLine))
            if (i%2 == 0){
                myEl.css('background','#eee');
            }
            else{
                myEl.css('background','#fff');

            }
         }
    }

    var previous = {};
    $scope.highlightCode = function(element) {
        if (!isEmpty(previous)) {
            clearLines(previous.startingLine, previous.endingLine);
        }

        for (var i=element.startingLine; i<=element.endingLine; i++){
            var currentLine = 'li:nth-child(' +i + ')';
            myEl = angular.element( document.querySelector(currentLine))
            if (i%2 == 0){
                myEl.css('background','#ffc0b7');
            }
            else {
                myEl.css('background', '#f9a89d');
            }
        }

        previous.endingLine = element.endingLine;
        previous.startingLine = element.startingLine;




        gotoAnchor(element)
    };

    $scope.getSymptomsFromMethod = function(element, syndrome){

        $scope.currentMethod =  element.name.substring(element.name.lastIndexOf('.')+1) + "()";
        $scope.symptomsMethod = [];

        for (var i = 0; i < syndrome.length; i++) {
            var symptom = syndrome[i];
            if (symptom.type != "class_smell"){

                for (var j = 0; j < symptom.elements.length; j++){
                    var currentElement = symptom.elements[j];

                    if (currentElement.name == element.name){
                        $scope.symptomsMethod.push({"symptomName": symptom.value, "reason": currentElement.reason});
                        break;
                    }
                }
            }
        }
    };

    var previousLocation = 0;
    gotoAnchor = function(element) {
        var firstLineElement =  ".linenums li:nth-child(" + element.startingLine + ")";
        $(function () {
            // console.log($(firstLineElement).position().top);
            $('div').animate({
                    scrollTop: $(firstLineElement).position().top + previousLocation

                },
                'slow');
            previousLocation = $(firstLineElement).position().top + previousLocation;
        });

    };
}]);