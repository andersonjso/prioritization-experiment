angular.module("myApp").controller('classCtr', ['$scope', '$routeParams', '$http', 'dataFactory', function($scope, $routeParams, $http, dataFactory){
    var className = $routeParams.name;

    getClass();
    getSymptoms();
    start();

    function getClass(){
        dataFactory.getClass(className)
            .then (function(response){
                $scope.currentClass = response.data;
            });
    }

    $scope.chooseSuggestions = function(){
        angular.forEach($scope.currentClass.filterSuggestion, function(suggestionList){
            console.log(suggestionList);
            angular.forEach(suggestionList, function (suggestion) {

                $scope[suggestion + "Checked"] = true;
            })
        });
    }

    $scope.filter = function(){

        $scope.listSymptoms = [];

        angular.forEach($scope.symptomsToFilter, function (symptomType) {
            angular.forEach(symptomType.symptoms, function(symptom){
                if (symptom.selected) $scope.listSymptoms.push(symptom.value);
            })

        });
    }

    //duplicated
    function getSymptoms(){
        dataFactory.getSymptoms()
            .then (function(response){
                $scope.symptomsToFilter = response.data;
            });
    }

    function start(){

    }

}]);