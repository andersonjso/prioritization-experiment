angular.module("myApp").controller('dashboardCtr', ['$scope', '$location','$http', 'dataFactory',
    function($scope, $location, $http, dataFactory){


        $.getJSON('../data/symptoms.json', function (data) {
            $scope.classes = data;
        });

        var symptomsToExclude = "empty";
        var listSymptoms = [];
        $scope.firstPage = true;
        console.log($scope.firstPage);

        getClasses();

        $scope.isActivesmell = true;
        $scope.isActivearchitectural = true;
        $scope.isActiveobject = true;
        $scope.isActivenonfunctional = true;
        $scope.isActivestructural = true;

        $scope.filterSymptom = function(symptom){
            if (listSymptoms.includes(symptom)) {
                var i = listSymptoms.indexOf(symptom);
                if(i != -1) {
                    listSymptoms.splice(i, 1);

                    switch (symptom){
                        case 'smell':
                            $scope.isActivesmell = true;
                            break;
                        case 'architectural':
                            $scope.isActivearchitectural =  true;
                            break;
                        case 'object':
                            $scope.isActiveobject = true;
                            break;
                        case 'nonfunctional':
                            $scope.isActivenonfunctional = true;
                            break;
                        case 'structural':
                            $scope.isActivestructural = true;
                            break;
                        default:
                            break;
                    }
                }
            }
            else{
                listSymptoms.push(symptom);
                switch (symptom) {
                    case 'smell':
                        $scope.isActivesmell = false;
                        break;
                    case 'architectural':
                        $scope.isActivearchitectural =  false;
                        break;
                    case 'object':
                        $scope.isActiveobject = false;
                        break;
                    case 'nonfunctional':
                        $scope.isActivenonfunctional = false;
                        break;
                    case 'structural':
                        $scope.isActivestructural = false;
                        break;
                    default:
                        break;
                }
            }

            if (listSymptoms.length == 0){
                symptomsToExclude = "empty";
            }
            else{
                symptomsToExclude = listSymptoms.toString().replace('[', '').replace(']', '');
            }

            getClasses();
        }

        function getClasses(){
            dataFactory.getClasses(symptomsToExclude)
                .then (function(response){
                    $scope.classes = response.data;
                });
        }

        $scope.go = function(chosenClass){
            $location.path('/class/' + chosenClass.sourceFile.name);
        }

    }]);