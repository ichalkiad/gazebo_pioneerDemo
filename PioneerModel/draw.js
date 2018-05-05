var width = 500,
    height = 500,
    radius = Math.min(width, height) / 2,
    innerRadius = 0.2 * radius;

var pie = d3.layout.pie()
    .sort(null)
    .startAngle(0)
    .value(function(d) { return  100; } ); //d.weight; });



var arc = d3.svg.arc()
  .innerRadius(innerRadius)
  .outerRadius(function (d) { 
      return (radius - innerRadius) * d.data.weight + innerRadius; 
  })
    .startAngle(function(d) { return d.data.startAngle; })
    .endAngle(function(d) { return d.data.endAngle; });

var outlineArc = d3.svg.arc()
        .innerRadius(innerRadius)
        .outerRadius(radius);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");



d3.csv('aster_data.csv', function(error, data) {

  data.forEach(function(d) {
    d.color  =  d.color;
    d.score  = +d.score;
    d.weight  = +d.weight;
    d.startAngle = +d.startAngle;
    d.endAngle = +d.endAngle; 
  });
  
  var path = svg.selectAll(".solidArc")
      .data(pie(data))
      .enter().append("path")
      .attr("fill", function(d) { return d.data.color; })
      .attr("class", "solidArc")
      .attr("stroke", "gray")
      .attr("d", arc)
      .on('mouseout', tip.hide);

  var outerPath = svg.selectAll(".outlineArc")
      .data(pie(data))
      .enter().append("path")
      .attr("fill", "none")
      .attr("stroke", "gray")
      .attr("class", "outlineArc")
      .attr("d", outlineArc);  




});
