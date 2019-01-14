angular.module("myApp").controller('dashboardCtr', ['$scope', '$location','$http', 'dataFactory',
    function($scope, $location, $http, dataFactory){

        importData();

        $.getJSON('../data/symptoms.json', function (data) {
            $scope.classes = data;
        });

        var symptomsToExclude = "empty";
        var listSymptoms = [];
        $scope.firstPage = true;

        getClasses();

        $scope.redirect = function(){
            $location.url('/sc/' + $scope.selectedClass);
        }

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

        function importData(){
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

                $scope.selectedClass = selectedClass.name;



            });

        }

        //function createChordDirective (csv, el, symptoms, relations, scope, selectedClass, data) {
        function createChordDirective (scope, data, selectedClass) {
            var el = $("#chordDiagramId");  //REFERENCE FOR THE CHORD DIAGRAM IN THE HTML PAGE

            var csv = [];               //  STORE THE DATA TO CREATE THE CHORD
            var relations = {};         //  STORE THE RELATIONS AMONG THE SYMPTOMS
            var symptoms = {}           //  STORE THE SYMPTOMS WHERE THE SYMPOTM ID IS THE KEY
            var classes = [];           //  STORE THE CLASSES

            var size = [750, 750]; // SVG SIZE WIDTH, HEIGHT
            var marg = [50, 50, 50, 50]; // TOP, RIGHT, BOTTOM, LEFT
            var dims = []; // USABLE DIMENSIONS
            dims[0] = size[0] - marg[1] - marg[3]; // WIDTH
            dims[1] = size[1] - marg[0] - marg[2]; // HEIGHT

            var activatedSymptomInfo;    //store the name of the symptom that has the info displayed

            var colors = d3.scale.ordinal()
                .range(['#122f3d', '#be3e2b']);

            var i = 0;
            var chord = d3.layout.chord()
                .padding(0.02)
                .sortGroups(d3.descending)
                .sortSubgroups(d3.ascending);

            var matrix = createChordMatrix().chordMatrix()
                .layout(chord)
                .filter(function (item, r, c) {
                    return (item.symptom1 === r.name && item.symptom2 === c.name) ||
                        (item.symptom1 === c.name && item.symptom2 === r.name);
                })
                .reduce(function (items, r, c) {
                    var value;
                    if (!items[0]) {
                        value = 0;
                    } else {
                        value = items.reduce(function (m, n) {
                            if (r === c) {
                                return m + (n.flow1 + n.flow2);
                            } else {
                                return m + (n.symptom1 === r.name ? n.flow1: n.flow2);
                            }
                        }, 0);
                    }
                    return {value: value, data: items};
                });

            var innerRadius = (dims[1] / 2) - 100;

            var arc = d3.svg.arc()
                .innerRadius(innerRadius)
                .outerRadius(innerRadius + 20);

            var path = d3.svg.chord()
                .radius(innerRadius);

            var svg = d3.select(el[0]).append("svg")
                .attr("class", "chart")
                .attr({width: size[0] + "px", height: size[1] + "px"})
                .attr("preserveAspectRatio", "xMinYMin")
                .attr("viewBox", "0 0 " + size[0] + " " + size[1]);

            var container = svg.append("g")
                .attr("class", "container")
                .attr("transform", "translate(" + ((dims[0] / 2) + marg[3]) + "," + ((dims[1] / 2) + marg[0]) + ")");

            var messages = svg.append("text")
                .attr("class", "messages")
                .attr("transform", "translate(10, 20)")
                .text("Atualizando...");


            //DRAW CHORD FUNCTION
            var drawChords = function (data, el, filter) {
                messages.attr("opacity", 1);
                messages.transition().duration(1000).attr("opacity", 0);

                matrix.data(data)
                    .resetKeys()
                    //.addKeys(['symptom1', 'symptom2'])
                    .addKeys(['symptom1', 'symptom2'], ['idS1', 'idS2'])
                    .update()

                var groups = container.selectAll("g.group")
                    .data(matrix.groups(), function (d) { return d._id; });

                var gEnter = groups.enter()
                    .append("g")
                    .attr("class", "group");






                gEnter.append("path")
                    .style("pointer-events", "none")
                    .style("fill", function (d) {
                        var info = matrix.read(d);    //info now has the symptom id (gid) and the symptom name (gname)
                        var infoSymptom = symptoms[info.gid];

                        //   console.log(infoSymptom)

                        return colors(infoSymptom.type); })
                    .attr("d", arc);

                gEnter.append("text")
                    .attr("dy", ".35em")
                    .on("click", groupClick)
                    .on("mouseover", updateGroup)
                    .on("mouseout", hideTooltip)
                    .text(function (d) {
                        return d._id;
                    });

                groups.select("path")
                    .transition().duration(2000)
                    .attrTween("d", matrix.groupTween(arc));

                groups.select("text")
                    .transition()
                    .duration(2000)
                    .attr("transform", function (d) {
                        d.angle = (d.startAngle + d.endAngle) / 2;
                        var r = "rotate(" + (d.angle * 180 / Math.PI - 90) + ")";
                        var t = " translate(" + (innerRadius + 26) + ")";
                        return r + t + (d.angle > Math.PI ? " rotate(180)" : " rotate(0)");
                    })
                    .attr("text-anchor", function (d) {
                        return d.angle > Math.PI ? "end" : "begin";
                    });

                groups.exit().select("text").attr("fill", "orange");
                groups.exit().select("path").remove();

                groups.exit().transition().duration(1000)
                    .style("opacity", 0).remove();

                var chords = container.selectAll("path.chord")
                    .data(matrix.chords(), function (d) { return d._id; });

                chords.enter().append("path")
                    .attr("class", "chord")
                    .style("fill", function (d) {
                        var info = matrix.read(d);    //info now has the symptom id (gid) and the symptom name (gname)

                        if ((info.sdata.data).length > 0){
                            return colors(info.sdata.data[0].type);
                        }

                        return '#ffffff';
                    })
                    .attr("d", path)
                    .on("mouseover", chordMouseover)
                    .on("mouseout", hideTooltip);

                chords.transition().duration(2000)
                    .attrTween("d", matrix.chordTween(path));

                chords.exit().remove()

                function groupClick(d) {
                    d3.event.preventDefault();
                    d3.event.stopPropagation();

                    updateSymptomInfo(d);
                    d3.select("#symptombox").style("opacity", 1);

                }

                function chordMouseover(d) {
                    d3.event.preventDefault();
                    d3.event.stopPropagation();
                    dimChords(d);
                    d3.select("#tooltip").style("opacity", 1);
                    updateTooltip(matrix.read(d));
                }

                function updateTooltip(d) {
                    try{
                        var s1 = d.sname;
                        var s2 = d.tname;
                        var stotal = d.stotal;
                        var ttotal = d.ttotal;
                        var relType = d.sdata.data[0].type;

                        $("#tooltipLabel").html(
                            "O sintoma <strong>" + s1 +
                            "</strong> está relacionado com o sintoma <strong>" + s2 +
                            "</strong> por um relacionamento do tipo <strong>" + relType +
                            "<br>Stotal:" + stotal +
                            "<br>Ttotal:" + ttotal +
                            "<br>Mtotal" + d.mtotal +
                            "<br>sindex" + d.sindex  +
                            "<br>tindex" + d.tindex +
                            "</strong>"

                        );

                    }catch(error){
                        return;
                    }
                }

                function hideTooltip() {
                    d3.event.preventDefault();
                    d3.event.stopPropagation();
                    d3.select("#tooltip").style("opacity", 0);
                    resetChords();
                }


                function resetChords() {
                    d3.event.preventDefault();
                    d3.event.stopPropagation();
                    container.selectAll("path.chord").style("opacity",0.9);
                }

                function dimChords(d) {
                    d3.event.preventDefault();
                    d3.event.stopPropagation();
                    container.selectAll("path.chord").style("opacity", function (p) {
                        if (d.source) { // COMPARE CHORD IDS
                            return (p._id === d._id) ? 0.9: 0.1;
                        } else { // COMPARE GROUP IDS
                            return (p.source._id === d._id || p.target._id === d._id) ? 0.9: 0.1;
                        }
                    });

                }

                function updateGroup(d) {
                    d3.event.preventDefault();
                    d3.event.stopPropagation();
                    dimChords(d);

                    activatedSymptomInfo = d._id;

                    d3.select("#tooltip").style("opacity", 1);
                    updateTooltipGroup(d);
                }

                //UPDATE THE TOOLTIP WITH ALL THE RELATIONS OF A SYMPTOM
                function updateTooltipGroup(d) {
                    try{
                        var info = matrix.read(d);    //info now has the symptom id (gid) and the symptom name (gname)

                        var rel = relations[info.gid];

                        var html = "<strong>"+ info.gname + "</strong> se relaciona com:<br>";
                        var i = 0;

                        rel.forEach(function (item) {
                            html += "&nbsp;" + (++i) + ".<strong>" + item.name + "</strong>. Tipo de relacionamento: <strong>" + item.type + "</strong><br>";
                        });

                        $("#tooltipLabel").html(html);

                    }catch(error){
                        console.log(error);
                        return;
                    }
                }

                // UPDATE SYMPTOM INFO WITH ALL THE INFORMATION ABOUT THE SYMPTOM
                function updateSymptomInfo(d) {
                    try{
                        var info = matrix.read(d);    //info now has the symptom id (gid) and the symptom name (gname)


                        var rel = relations[info.gid];
                        var infoSymptom = symptoms[info.gid];

                        // console.log(infoSymptom)


                        var html = "Sintoma: <text id='infoSimptom'>" + infoSymptom.value + "</text><br>";
                        html += "Tipo do sintoma: <text id='infoType'>" + infoSymptom.type + "</text><br>";
                        html += "Elemento afetado: <text id='infoElement'>" + infoSymptom.element.name + "</text> (<text id='infoElementType'>" + infoSymptom.element.type + "</text>)<br>"
                        html += "<p>Sintomas Relacionados:";

                        var i = 0;
                        rel.forEach(function (item) {
                            html += "<br>&nbsp;" + (++i) + "." + item.name + ". Tipo de relacionamento: " + item.type;
                        });
                        html += "</p>";

                        $("#infoSymptomDiv").html(html);

                    }catch(error){
                        return;
                    }
                }


                // function that updates the chord
                function updateChordFilter() {

                    if(scope && scope.hasFilters){
                        drawChords(data.filter(function (d) {
                            var fl = scope.filters;
                            var v1 = d.symptom1, v2 = d.symptom2;

                            if ((fl[v1] && fl[v1].hide) || (fl[v2] && fl[v2].hide)) {
                                return false;
                            }
                            return true;
                        }));
                    }else{
                        if (data){
                            drawChords(data);
                        }
                    }

                }

                // in case there is any filter
                if(filter){
                    updateChordFilter();

                    var activatedSymptoms = matrix.getActivatedSymptomNames()
                    //Update the checkbox with all the activated symptoms
                    changeSymptomsCheckedAttribute(activatedSymptoms);

                    //hide the symptom information panel
                    var temp = false;
                    for(j = 0; j < activatedSymptoms.length; j++){
                        if(activatedSymptomInfo == activatedSymptoms[j]){
                            temp = true;
                            break;
                        }
                    }

                    if(!temp){
                        d3.select("#symptombox").style("opacity", 0);
                    }
                }

            }; // END DRAWCHORDS FUNCTION

            //CREATE THE CHORD DIAGRAM
            function loadDataDiagram() {
                var retorno = prepareSymptoms(scope[selectedClass.fullyQualifiedName]);

                csv = retorno[0];
                relations = retorno[1];
                symptoms = retorno[2];
                // console.log(symptoms)
            }

            //FUNCTION TO LOAD AND SHOW THE CLASSES IN THE RIGHT PANEL
            function showClassesPanel(){

                //add click function
                var canvas = d3.select('.side-nav').append("form")
                    .attr("width", 150)
                    .attr("height", 100).attr("ng-controller", "dashboardCtr");

                canvas.selectAll("label")
                    .data(data)
                    .enter()
                    .append("div")
                    .insert("input")
                    .attr({
                        type: "radio",
                        name: "classes",
                        class: "classElements",
                        id: function(d){
                            console.log(d.class);

                            classes.push(d.class.sourceFile.name);
                            return d.class.sourceFile.name;
                        },
                        value: function (d, i) {
                            //return "oi";
                            return d.class.sourceFile.fullyQualifiedName;
                        }
                    })
                    .attr("ng-model", "classesForm")
                    .attr({"ng-value": function(d){
                        return d.class.sourceFile.name;
                    }})
                    .attr("ng-click", "eae()")
                    .property("checked", function (d, i) {
                        $("#labelElement").html(selectedClass.name);
                        return i === j;
                    })
                    .on("click", function(d) {
                        inputClickEvent(d);
                        console.log($scope.selectedClass);
                        $scope.selectedClass = selectedClass.name;//UPDATE THE LIST OF SYMPTOMS IN THE RIGHT PANEL
                    });

                // function that hadles the click event on the input
                function inputClickEvent(d) {

                    selectedClass.name = d.class.sourceFile.name;
                    selectedClass.fullyQualifiedName = d.class.sourceFile.fullyQualifiedName;

                    $("#labelElement").html(selectedClass.name);
                    showSymptoms(d);            //UPDATE THE LIST OF SYMPTOMS IN THE RIGHT PANEL

                    d3.select("#symptombox").style("opacity", 0);
                }

                //INCLUDE A TEXT FIELD NEXT TO EACH INPUT
                var idInput;
                for(i = 0; i < classes.length; i++){
                    idInput = classes[i];

                    var html = "<text id='" + idInput +"'> " + idInput + "</text>";

                    $(html).insertAfter("#" + idInput).on("click", function (d) {
                        $("#"+ d.currentTarget.id).trigger("click");
                    });
                }

                showSymptoms(scope[selectedClass.fullyQualifiedName]);

            }


            function showSymptoms(data) {
                updateCSVSymptoms(data);

                var container = $("#divSymptoms");
                container.empty();

                d3.select("#divSymptoms").selectAll("input")
                    .data(data.class.syndrome)
                    .enter()
                    .append("div")
                    .append("input")
                    .attr("checked", true)
                    .attr("type", "checkbox")
                    .attr("class", "symptomCheckboxes")
                    .attr("id", function(d,i) {
                        return d.value; })
                    .on("click", function (d) {
                        updateChord(this);
                    });

                //INCLUDE A TEXT FIELD NEXT TO EACH INPUT
                var idInput;

                for (index in symptoms){
                    idInput = symptoms[index].value;

                    var html = "<text id='" + idInput +"'> " + idInput + "</text>"
                    var idPattern = "input[id='" + idInput + "']";

                    $(html).insertAfter(idPattern).on("click", function (d) {
                        idPattern = "input[id='" + d.currentTarget.id + "']";

                        $(idPattern).trigger("click");
                    })
                }

                //coloca o botão de filtro no estado original
                $("#buttonSelectSymptoms").text("Deselecionar todos");
            }

            function updateChord(element) {
                //test if the checkbox is enabled or not
                if(element.checked){

                    //update the filters by removing the symptom from the filter list
                    scope.removeFilter(element.id);
                }else{
                    scope.addFilter(element.id);
                }
                drawChords(csv, el, true);
            }



            loadDataDiagram();
            showClassesPanel();
            drawChords(csv, el, false);


            //MONITOR THE SELECT OF ALL SYMPTOMS
            $("#buttonSelectSymptoms").click(function (d){
                if (d.target.value === "Deselecionar todos"){
                    drawChords(csv, el, true);
                }else{
                    drawChords([], el, true);
                }

            });

            //MONITOR THE SELECTION OF A CLASS
            $(".classElements").click(function (d){

                try {
                    updateCSVSymptoms(scope[d.target.value]);

                    drawChords(csv, el, false);
                } catch (error) {
                    return;
                }


            });

            //AUXILIAR FUNCTION TO KEEP THE SYMPTOMS UPDATED WITH THE SELECTED CLASS
            function updateCSVSymptoms(value) {

                var retorno = prepareSymptoms(value);

                csv = retorno[0];
                relations = retorno[1];
                symptoms = retorno[2];
            }

            function resize() {
                var width = el.parent()[0].clientWidth;

                svg.attr({
                    width: width,
                    height: width / (size[0] / size[1])
                });
            }


            resize();

        }; // END LINK FUNCTION

        function createChordMatrix() {

            var chordMatrix = function () {

                var _matrix = [], dataStore = [], _id = 0;
                var matrixIndex = [], indexHash = {};
                var chordLayout, layoutCache;

                var filter = function () {};
                var reduce = function () {};

                var matrix = {};

                matrix.update = function () {
                    _matrix = [], objs = [], entry = {};

                    layoutCache = {groups: {}, chords: {}};

                    this.groups().forEach(function (group) {
                        layoutCache.groups[group._id] = {
                            startAngle: group.startAngle,
                            endAngle: group.endAngle
                        };
                    });

                    this.chords().forEach(function (chord) {
                        layoutCache.chords[chordID(chord)] = {
                            source: {
                                _id: chord.source._id,
                                startAngle: chord.source.startAngle,
                                endAngle: chord.source.endAngle
                            },
                            target: {
                                _id: chord.target._id,
                                startAngle: chord.target.startAngle,
                                endAngle: chord.target.endAngle
                            }
                        };
                    });

                    matrixIndex = Object.keys(indexHash);

                    for (var i = 0; i < matrixIndex.length; i++) {
                        if (!_matrix[i]) {
                            _matrix[i] = [];
                        }
                        for (var j = 0; j < matrixIndex.length; j++) {
                            objs = dataStore.filter(function (obj) {
                                return filter(obj, indexHash[matrixIndex[i]], indexHash[matrixIndex[j]]);
                            });
                            entry = reduce(objs, indexHash[matrixIndex[i]], indexHash[matrixIndex[j]]);
                            entry.valueOf = function () { return +this.value };
                            _matrix[i][j] = entry;
                        }
                    }
                    chordLayout.matrix(_matrix);
                    return _matrix;
                };

                matrix.data = function (data) {
                    dataStore = data;
                    return this;
                };

                matrix.filter = function (func) {
                    filter = func;
                    return this;
                };

                matrix.reduce = function (func) {
                    reduce = func;
                    return this;
                };

                matrix.layout = function (d3_chordLayout) {
                    chordLayout = d3_chordLayout;
                    return this;
                };

                matrix.groups = function () {
                    return chordLayout.groups().map(function (group) {
                        group._id = matrixIndex[group.index];
                        return group;
                    });
                };

                matrix.chords = function () {
                    return chordLayout.chords().map(function (chord) {
                        chord._id = chordID(chord);
                        chord.source._id = matrixIndex[chord.source.index];
                        chord.target._id = matrixIndex[chord.target.index];
                        return chord;
                    });
                };

                matrix.addKey = function (key, sid, data) {
                    if (!indexHash[key]) {
                        indexHash[key] = {name: key, sid: sid, data: data || {}};
                    }
                };

                /*matrix.addKey = function (key, data) {
                 if (!indexHash[key]) {
                 indexHash[key] = {name: key, data: data || {}};
                 }
                 };*/

                matrix.addKeys = function (props, idProps, fun) {
                    for (var i = 0; i < dataStore.length; i++) {
                        for (var j = 0; j < props.length; j++) {
                            //this.addKey(dataStore[i][props[j]], fun ? fun(dataStore[i], props[j]):{});
                            this.addKey(dataStore[i][props[j]], dataStore[i][idProps[j]], fun ? fun(dataStore[i], props[j],dataStore[i][idProps[j]]):{});
                        }
                    }
                    return this;
                };

                matrix.resetKeys = function () {
                    indexHash = {};
                    return this;
                };

                function chordID(d) {
                    var s = matrixIndex[d.source.index];
                    var t = matrixIndex[d.target.index];
                    return (s < t) ? s + "__" + t: t + "__" + s;
                }

                matrix.groupTween = function (d3_arc) {
                    return function (d, i) {
                        var tween;
                        var cached = layoutCache.groups[d._id];

                        if (cached) {
                            tween = d3.interpolateObject(cached, d);
                        } else {
                            tween = d3.interpolateObject({
                                startAngle:d.startAngle,
                                endAngle:d.startAngle
                            }, d);
                        }

                        return function (t) {
                            return d3_arc(tween(t));
                        };
                    };
                };

                matrix.chordTween = function (d3_path) {
                    return function (d, i) {
                        var tween, groups;
                        var cached = layoutCache.chords[d._id];

                        if (cached) {
                            if (d.source._id !== cached.source._id){
                                cached = {source: cached.target, target: cached.source};
                            }
                            tween = d3.interpolateObject(cached, d);
                        } else {
                            if (layoutCache.groups) {
                                groups = [];
                                for (var key in layoutCache.groups) {
                                    cached = layoutCache.groups[key];
                                    if (cached._id === d.source._id || cached._id === d.target._id) {
                                        groups.push(cached);
                                    }
                                }
                                if (groups.length > 0) {
                                    cached = {source: groups[0], target: groups[1] || groups[0]};
                                    if (d.source._id !== cached.source._id) {
                                        cached = {source: cached.target, target: cached.source};
                                    }
                                } else {
                                    cached = d;
                                }
                            } else {
                                cached = d;
                            }

                            tween = d3.interpolateObject({
                                source: {
                                    startAngle: cached.source.startAngle,
                                    endAngle: cached.source.startAngle
                                },
                                target: {
                                    startAngle: cached.target.startAngle,
                                    endAngle: cached.target.startAngle
                                }
                            }, d);
                        }

                        return function (t) {
                            return d3_path(tween(t));
                        };
                    };
                };

                matrix.read = function (d) {
                    var g, m = {};


                    if (d.source) {
                        m.sname  = d.source._id;
                        m.sdata  = d.source.value;
                        m.svalue = +d.source.value;
                        m.sindex = d.source.index;
                        m.tindex = d.target.index;
                        m.stotal = _matrix[d.source.index].reduce(function (k, n) { return k + n; }, 0);
                        m.tname  = d.target._id;
                        m.tdata  = d.target.value;
                        m.tvalue = +d.target.value;
                        m.ttotal = _matrix[d.target.index].reduce(function (k, n) { return k + n; }, 0);
                    } else {
                        //  console.log(d)
                        g = indexHash[d._id];
                        m.gname  = g.name;
                        m.gdata  = g.data;
                        m.gvalue = d.value;
                        m.gid = g.sid;                //SYMPTOM ID
                    }
                    m.mtotal = _matrix.reduce(function (m1, n1) {
                        return m1 + n1.reduce(function (m2, n2) { return m2 + n2; }, 0);
                    }, 0);
                    return m;
                };

                //RETURN THE ID OF THE SYMPTOM
                matrix.getActivatedSymptomNames = function (){
                    return Object.keys(indexHash);

                }

                return matrix;
            };

            return {
                chordMatrix: chordMatrix
            };
        }




    }]);