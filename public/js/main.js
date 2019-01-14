/**
 * Created by andersonjso on 3/13/18.
 */

var app = angular.module("myApp", ["ngRoute"]);

app.config(function($routeProvider){
    $routeProvider
        .when("/", {
            templateUrl : "html/chords.html",
            controller: "dashboardCtr",
        })
        .when("/sc/:name", {
            templateUrl: "html/sourceCode.html",
            controller: "sourceCodeCtr",
        })
        .when("/symptoms", {
            templateUrl : "html/symptoms.html",
            controller: "symptomCtr",
        })
        .when("/designproblems", {
            templateUrl : "html/designproblems.html",
            controller: "dpCtr",
        })
        .when("/class/:name", {
            templateUrl : "html/classrepresentation.html",
            controller: "classCtr",
        });
})

app.factory('dataFactory', ['$http', function($http){
    var dataFactory = {};

    dataFactory.retrieveData = function(){
        return $http.get('/convert')
    }

    dataFactory.getClasses = function(data){
        return $http.put('/classes', data)
    }

    dataFactory.getSymptoms = function(){
        return $http.get('/symptoms/type')
    }

    dataFactory.sendExample = function(data){
        return $http.post('/snippets', data)
    }

    dataFactory.addMetadata = function(id, data){
        return $http.post('/snippets/metadata/' + id, data)
    }

    dataFactory.showExamplesByType = function(value){
        return $http.get('/snippets/' + value)
    }

    dataFactory.getSourceCode= function(id){
        return $http.get('/snippets/sourcecode/' + id)
    }

    dataFactory.getDesignProblems = function(){
        return $http.get('/designproblems')
    }

    dataFactory.updateDPWithSet = function (dpName, data) {
        return $http.put('/designproblem/' + dpName + '/set', data)
    }

    dataFactory.getClass= function(className){
        return $http.get('/class/' + className)
    }

    return dataFactory;
}])