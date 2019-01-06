angular.module("myApp").controller('symptomCtr', ['$scope', '$http', 'dataFactory', function($scope, $http, dataFactory){

    getSymptoms();

    $scope.allSymptoms = [];
    function getSymptoms(){
        dataFactory.getSymptoms()
            .then (function(response){
                $scope.symptoms = response.data;

                angular.forEach($scope.symptoms, function(symptomType){
                    angular.forEach(symptomType.symptoms, function (symptom) {
                        var currentSymptom = {
                            type: symptomType.typeSymptom,
                            value:  symptom.value,
                        }

                        $scope.allSymptoms.push(currentSymptom);
                    })
                });
            });
    }

    $scope.sendExample = function(symptom, metadata) {
        var file = document.getElementById("inputFile").files[0];

        var fd = new FormData();

        fd.append("file", file);

        $http({
            method: 'POST',
            url: '/snippets',
            headers: {'Content-Type': undefined},
            data: fd,
            transformRequest: angular.identity,
            transformResponse: angular.identity
        }).then(function(response) {
            var snippetMetadata = {
                userName: metadata.userName,
                fileName: metadata.fileName,
                description: metadata.description,
                idSourceFile: response.data,
                symptom: {
                    value: metadata.chosenSymptom
                }
            };

            dataFactory.addMetadata(response.data, snippetMetadata)
                .then (function(response){
                    $scope.saved = true;
                });
        }).catch(function(err) {
            console.log(err);
        });
    }

    $scope.showExamples = function(symptom){

        $scope.exampleSelected = false;
        $scope.sourceCode = "";

        dataFactory.showExamplesByType(symptom.value)
            .then (function(response){
                $scope.examples = response.data
            });
    }

    $scope.updateCurrentExample = function(example){
        $scope.exampleSelected = true;
        $scope.currentExample = example;

        dataFactory.getSourceCode(example.idSourceFile)
            .then(function (response) {
                $scope.sourceCode = response.data
            })
    }

    $('#examplesByTypeModal').on('hidden.bs.modal', function(){
        $(this).find('form')[0].reset();
    });
}]);