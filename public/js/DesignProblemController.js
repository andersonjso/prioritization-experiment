angular.module("myApp").controller('dpCtr', ['$scope', '$http', 'dataFactory', function($scope, $http, dataFactory){
    getDesignProblems();
    getSymptoms();

    function getDesignProblems(){
        dataFactory.getDesignProblems()
            .then (function(response){
                $scope.designProblems = response.data;
            });
    }


//duplicated
    function getSymptoms(){
        dataFactory.getSymptoms()
            .then (function(response){
                console.log("aes")
                $scope.symptoms = response.data;

                console.log($scope.symptoms)
            });
    }

    $scope.sendSet = function(designProblem){
        $scope.selectedSymptoms = [];

        angular.forEach($scope.symptoms, function(symptomType){
            //  console.log(symptomType.symptoms.length);
            angular.forEach(symptomType.symptoms, function (symptom) {
                //   console.log(symptom);
                var chosenSymptom = {
                    type: symptomType.typeSymptom,
                    value:  symptom.value,
                }
                if (symptom.selected) $scope.selectedSymptoms.push(
                    chosenSymptom
                );
            })
        });

        var setSymptomsToSend = {
            symptoms: $scope.selectedSymptoms,
            user: $scope.userName
        }

        dataFactory.updateDPWithSet($scope.chosenDP, setSymptomsToSend)
            .then (function(response){
                getDesignProblems();

            });


    }

    $scope.changeCurrentDP = function(designProblem){

        // console.log(designProblem);
        $scope.currentDP = designProblem;
    }
}]);