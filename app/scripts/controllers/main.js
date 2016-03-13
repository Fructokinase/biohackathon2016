'use strict';

/**
 * @ngdoc function
 * @name rnaVisualApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the rnaVisualApp
 */
angular.module('rnaVisualApp')
  .controller('MainCtrl', ["$scope", function ($scope) {

    $scope.dot = "(((..[[[[)))..]]]]....".split("");
    $scope.RNA = "CCUUACCUCGGGUAGAGGCCCA".split("");



    var color = ["yellow", "geeen", "blue", "red"]
    var RNA_BASE = ["C", "G", "A", "U"];

    $scope.data = [];
    var base_links = [];
    var base_pseudo_links = [];

    $scope.start = function() {
    for (var i = 0; i < $scope.dot.length; i++) {
        if ($scope.dot[i] == "(") {
            var bracket_index = i+1
            var bracket_score = 1;
            while($scope.dot[bracket_index] != undefined  && bracket_score > 0) {

                if ($scope.dot[bracket_index] == "(" ) {
                    bracket_score = bracket_score + 1;
                } 

                if ($scope.dot[bracket_index] == ")") {
                    bracket_score = bracket_score - 1;
                }

                if (bracket_score == 0) {
                    base_links.push([i, bracket_index]);
                }

                bracket_index = bracket_index + 1;
            }
        }

        if ($scope.dot[i] == "[") {
            var bracket_index = i+1
            var bracket_score = 1;
            while($scope.dot[bracket_index] != undefined  && bracket_score > 0) {

                if ($scope.dot[bracket_index] == "[" ) {
                    bracket_score = bracket_score + 1;
                } 

                if ($scope.dot[bracket_index] == "]") {
                    bracket_score = bracket_score - 1;
                }

                if (bracket_score == 0) {
                    base_pseudo_links.push([i, bracket_index]);
                }

                bracket_index = bracket_index + 1;
            }
        }

        $scope.data.push([$scope.RNA[i], $scope.dot[i]]);
    }

    $scope.dotNotation = $scope.dot.join("");
    console.log($scope.data);

    var w = 960, h = 500;

            var labelDistance = 0;

            var vis = d3.select("#rnastruct").append("svg:svg").attr("width", w).attr("height", h);

            var nodes = [];
            var labelAnchors = [];
            var labelAnchorLinks = [];
            var links = [];

            for(var i = 0; i < $scope.data.length; i++) {
                var node = {
                    label : $scope.data[i][0]
                };
                nodes.push(node);
                labelAnchors.push({
                    node : node
                });
                labelAnchors.push({
                    node : node
                });
            };

            for(var i = 0; i < nodes.length-1; i++) {
                        links.push({
                            source : i,
                            target : i+1,
                            weight : 0.5,
                            style: {"color": "red"}
                        });
                labelAnchorLinks.push({
                    source : i * 2,
                    target : i * 2 + 1,
                    weight : 1
                });
            };

            for(var i = 0; i < base_links.length; i++) {
                links.push({
                    source: base_links[i][0],
                    target: base_links[i][1],
                    weight: 0.5
                })
            };


            for(var i = 0; i < base_links.length; i++) {
                links.push({
                    source: base_pseudo_links[i][0],
                    target: base_pseudo_links[i][1],
                    weight: 0.5
                })
            }



            var force = d3.layout.force().size([w, h]).nodes(nodes).links(links).gravity(1).linkDistance(50).charge(-3000).linkStrength(function(x) {
                console.log("daad", x)
                return x.weight * 10
            });


            force.start();

            var force2 = d3.layout.force().nodes(labelAnchors).links(labelAnchorLinks).gravity(0).linkDistance(0).linkStrength(8).charge(-100).size([w, h]);
            force2.start();

            var link = vis.selectAll("line.link").data(links).enter().append("svg:line").attr("class", "link").style("stroke", "#CCC");

            var node = vis.selectAll("g.node").data(force.nodes()).enter().append("svg:g").attr("class", "node");
            var current_color;
            for (var i in $scope.RNA) {
                current_color = color[RNA_BASE.indexOf($scope.RNA[i])];
                node.append("svg:circle").attr("r", 5).style("fill", "black").style("stroke", "#FFF").style("stroke-width", 3);
            }
            
            node.call(force.drag);

            console.log("node", node)


            var anchorLink = vis.selectAll("line.anchorLink").data(labelAnchorLinks)//.enter().append("svg:line").attr("class", "anchorLink").style("stroke", "#999");

            var anchorNode = vis.selectAll("g.anchorNode").data(force2.nodes()).enter().append("svg:g").attr("class", "anchorNode");
            anchorNode.append("svg:circle").attr("r", 0).style("fill", "black");
                anchorNode.append("svg:text").text(function(d, i) {
                return i % 2 == 0 ? "" : d.node.label
            }).style("fill", "#555").style("font-family", "Arial").style("font-size", 12);

            var updateLink = function() {
                this.attr("x1", function(d) {
                    return d.source.x;
                }).attr("y1", function(d) {
                    return d.source.y;
                }).attr("x2", function(d) {
                    return d.target.x;
                }).attr("y2", function(d) {
                    return d.target.y;
                });

            }

            var updateNode = function() {
                this.attr("transform", function(d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });

            }


            force.on("tick", function() {

                force2.start();

                node.call(updateNode);

                anchorNode.each(function(d, i) {
                    if(i % 2 == 0) {
                        d.x = d.node.x;
                        d.y = d.node.y;
                    } else {
                        var b = this.childNodes[1].getBBox();

                        var diffX = d.x - d.node.x;
                        var diffY = d.y - d.node.y;

                        var dist = Math.sqrt(diffX * diffX + diffY * diffY);

                        var shiftX = b.width * (diffX - dist) / (dist * 2);
                        shiftX = Math.max(-b.width, Math.min(0, shiftX));
                        var shiftY = 5;
                        this.childNodes[1].setAttribute("transform", "translate(" + shiftX + "," + shiftY + ")");
                    }
                });


                anchorNode.call(updateNode);

                link.call(updateLink);
                anchorLink.call(updateLink);

            });
}

$scope.start();

  }]);
