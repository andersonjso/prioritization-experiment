/**
 * Since we are using the class qualified name as a key, thus we expect that the system won't have
 * two classes with the same qualified name
 */
function importData2(){
    var selectedClass = {       // STORE THE SELECTED CLASS IN THE CLASS PANEL [CLASS, FULLQUALIFIEDNAME]
        name: "",
        fullyQualifiedName: "",
    };  

    var scope = {};             //  STORE THE DATA
    scope.filters = {};
    scope.hasFilters = false;



    d3.json('../data/symptoms.json', function(err, data){
    j = 0;
    
    data.forEach(function (d, i) {
        if (i == 0){
            selectedClass.name = d.class.sourceFile.name;
            selectedClass.fullyQualifiedName = d.class.sourceFile.fullyQualifiedName;
        }
        if(!scope[d.class.sourceFile.fullyQualifiedName]){
            scope[d.class.sourceFile.fullyQualifiedName] = [] // STORED BY THE CLASS FULLQUALIFIEDNAME
        }
        scope[d.class.sourceFile.fullyQualifiedName] = d;
    });

    scope.addFilter = function(name){
        scope.hasFilters = true;
        scope.filters[name] = {
            name: name,
            hide: true,
        };
    }

    scope.removeFilter = function(name){
        delete scope.filters[name];
        scope.hasFilters = false;

        $.each(scope.filters, function (key, value){
            if(value.hide == true){
                scope.hasFilters = true;
            }
        });
        
    }   

        createChordDirective(scope, data, selectedClass);

    });

}