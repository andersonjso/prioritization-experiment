function prepareSymptoms(element) {
    var csv = [];
    var syndrome = element.class.syndrome;

    var ids = {};           // store the pair id-name, where name comprises the symptom name
    var relations = {}      // store the relations of each symptom
    var symptoms = {}       // store all the symptoms organized by the id

    //update all the ids with their real symptom name
    syndrome.forEach(function (d) {
    //    console.log(d)
        if(!ids[d.id]){
            ids[d.id] = "";
        }
        ids[d.id] = d.value;
    });

    //update the relations, changing the id for the name
    syndrome.forEach(function (d) {
       
        if(!relations[d.id]){
            relations[d.id] = [];
            symptoms[d.id] = d;
        }
        //console.log(d)
        //get all the relations
        d.relation.forEach(function (r) {            

            r.relatedSymptoms.forEach(function (rs){
                var rel  = {
                    id: rs,                // the id of the related symptom
                    name: ids[rs],         // the name of the related symptom
                    type: r.type,
                };

                csv.push({
                    symptom1: d.value,
                    symptom2: ids[rs],
                    flow1: 1,           //the weight of the relation goes here
                    flow2: 1,
                    type: r.type,
                    idS1: d.id,
                    idS2: rs,
                });
                relations[d.id].push(rel);
            });
            
        });
        
    });

    return [csv, relations, symptoms];
}