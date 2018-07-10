function make_bar(h,w,mutual_info,variation_ratio,combined_confidence){

    var data = [{"name":["MI","VR","CC"], "score": [mutual_info,variation_ratio,combined_confidence]}];
    console.log(data);

   
    var width = 600;
    var height  = 500;
    var dataset = [mutual_info,variation_ratio,combined_confidence];

    var xScale = d3.scaleBand()
        .domain(d3.range(0, dataset.length))
		   .range([0, width], 0.5);
    var yScale = d3.scaleLinear()
                   .domain([0, d3.max(dataset)])
		   .range([0, height]);
    var svg = d3.select("#uncertainty")
		.append("svg")
         	.attr("width", width)
		.attr("height", height);
    svg.selectAll("rect")
       .data(dataset)
       .enter()
       .append("rect")
       .attr("x", function(d, i) {return xScale(i);  })
       .attr("y", function(d) {return height - yScale(d); })
       .attr("width", 50 )//xScale.bandwidth())
       .attr("height", function(d) {return yScale(d);  })
       .attr("fill", function(d) {return "rgb(0, 0, " + (d * 10) + ")";  })
       .on("mouseover", function(d) {var xPosition = parseFloat(d3.select(this).attr("x")) + xScale.bandwidth() / 2;
				     var yPosition = parseFloat(d3.select(this).attr("y")) / 2 + height / 2;
					d3.select("#tooltip")
					  .style("left", xPosition + "px")
                                          .style("top", yPosition + "px")
					  .select("#value")
					  .text(d);
					d3.select("#tooltip").classed("hidden", false);
			   })
        .on("mouseout", function() {d3.select("#tooltip").classed("hidden", true);  })
}



function make_circles(h,w,r_state,collision) {
  
          var opacity = [1.0,0.2,0.2]

//x: 50,250,450
          console.log(opacity)
          var jsonCircles = [
                       { "x_axis": -200, "y_axis": -150 , "radius": 30, "color" : "green", "opacity" :opacity[0] },
                       { "x_axis":  0, "y_axis": -150, "radius": 30, "color" : "yellow", "opacity" :opacity[1]},
                       { "x_axis": 200, "y_axis": -150, "radius": 30, "color" : "red", "opacity" :opacity[2]}];


          var svg = d3.select("#indicator").append("div")
	                                   .attr("class","canvas")
	                                   .classed("svg-container", true)
                                           .append("svg")
                                           .attr("preserveAspectRatio", "xMinYMin meet")
                                           .attr("viewBox", "-300 -600 600 640")
                                           .classed("svg-content-responsive", true);
    
          var circles = svg.selectAll("circle")
                           .data(jsonCircles)
                           .enter()
                           .append("circle");

  

          var circleAttributes = circles
                       .attr("cx",       function (d)  { return d.x_axis;  })
                       .attr("cy",       function (d)  { return d.y_axis;  })
                       .attr("r",        function (d)  { return d.radius;  })
                       .style("fill",    function(d)   { return d.color;   })
                       .style("opacity", function(d)   { return d.opacity; });

          console.log(r_state);
          if (r_state===1){
             var robotState = "Inspecting..."
             opacity[0] =  0.2
             opacity[1] = 1.0
             opacity[2] = 0.2
          } else if (r_state===2){
             var robotState = "I am confused..."
             opacity[0] =  1.0
             opacity[1] = 0.2
             opacity[2] = 0.2
          } else if (r_state===3){
             var robotState = "Collided!"
             opacity[0] = 0.2
             opacity[1] = 0.2
             opacity[2] = 1.0
          }

    // x: +150
          
           wd = d3.select("#piechart").node().getBoundingClientRect().width
           hd = d3.select("#piechart").node().getBoundingClientRect().height
           console.log(wd);
           console.log(hd);
    
          svg.append("text")
             .attr("class", "state")
             .attr("dy", ".35em")
             .attr("transform","translate("+"-"+wd/2+",-"+hd/2+")")
             .text(robotState)

/*
          d3.select("text.state")
           .transition()
           .duration(3000)
           .on("start", function repeat() {
                     var t = d3.active(this)
                     .style("opacity", 0)
                     .text("Moving...")
                     .transition(t)
                     .style("opacity", 1)
                     .text(robotState)
                     .delay(3000)
               });

*/
    
    
      }
  


function make_pie(w, h, scale, simpleScale, data, type, unc,val,sAngle,eAngle,id,label) {
                 
        var pie = d3.pie()
                    .sort(null)
                    .value(function(d,i) { return unc[i]; } );

        var arc = d3.arc()
                        .innerRadius(innerRadius)
                        .outerRadius(function (d,i) { 
                            return (radius - innerRadius) * unc[i]*2 + innerRadius; 
                        })
                        .startAngle(function(d,i) {return sAngle[i];})
                        .endAngle(function(d,i) {return eAngle[i];});

    yy = d3.select("#piechart").node().getBoundingClientRect().y
    xx = d3.select("#piechart").node().getBoundingClientRect().x
    wd = d3.select("#piechart").node().getBoundingClientRect().width
    hd = d3.select("#piechart").node().getBoundingClientRect().height


    console.log(yy)
    console.log(xx)
    console.log(wd)
    console.log(hd)



        var svg = d3.select("#piechart").append("div")
	                                .attr("class","canvas")
	                                .classed("svg-container", true)
                                        .append("svg")
                                        .attr("preserveAspectRatio", "xMinYMin meet")
                                        .attr("viewBox", "-300 -500 600 640")
                                        .classed("svg-content-responsive", true);

        var arcEnter = svg.selectAll(".solidArc").append("div")
                          .data(pie(unc))
                          .enter()
	                  .append("g")
                          .classed("solidArc", true)
                          .classed("svg-container", true)
                          .attr("preserveAspectRatio", "xMinYMin meet")
                          .attr("viewBox", "-200 -200 600 640")
                          .classed("svg-content-responsive", true);

                          //.attr("transform", "translate(-"+w/20+","+h/2+")");

        arcEnter.append("path")
                .attr("fill","rgb(120, 197, 120)") //function(d,i) {return simpleScale(1.0-unc[i]);})
                .attr("id", function(d,i) {return id[i];})
                .attr("stroke", "gray")
                .attr("d", arc);



        var direct = "Left";
        if (direction===2) {
           var direct = "Forward";
        }
        if (direction===0) {
           var direct = "Slightly Right";
        }
        if (direction===1) {
           var direct = "Right";
        }
          
        console.log(direction);
        svg.append("text")
          .attr("class", "direction")
          .attr("dy", ".35em")
          .attr("transform","translate(-"+w/3+","+h/2.5+")")
          .text(direct);                            
  
     
    //   create_circles(h,w,r_state,collision);     

 }

function visualise_vsup(data,r_state,collision,direction,mutual_info,variation_ratio,combined_confidence) {

        var label  = data.map(function(d) { return d.label; });
        var id     = data.map(function(d) { return d.id; });
        var sAngle = data.map(function(d) { return d.startAngle; });
        var eAngle = data.map(function(d) { return d.endAngle; });

        var val = data.map(function(d) { return d.Direction;   });
        var unc = data.map(function(d) { return d.Uncertainty; });
  
        var vDom = d3.extent(data.map(function(d) { return d.Direction; }));
        var uDom = d3.extent(data.map(function(d) { return d.Uncertainty; }));
        var uDomScale = d3.extent(data.map(function(d) { return 1.0-d.Uncertainty; }));
        var quantization = vsup.quantization().branching(2).layers(2).valueDomain(vDom).uncertaintyDomain(uDomScale);
        var scale = vsup.scale().quantize(quantization).range(d3.interpolateViridis);
        var squareQuantization = vsup.squareQuantization().n(4).valueDomain(vDom).uncertaintyDomain(uDom);
        var squareScale = vsup.scale().quantize(squareQuantization).range(d3.interpolateViridis);
        var simpleScale = d3.scaleQuantize().domain([0,1]).range(d3.quantize(d3.interpolateViridis, 5));

        
        var w = 1280;
        var h = 840;
        radius = Math.min(w, h) / 3;
        innerRadius = 0.2*radius;

        d3.selectAll("svg.canvas").remove();      
        make_pie(w, h, scale, simpleScale, data, "simple",unc,val,sAngle,eAngle,id,label,direction);
        make_circles(h,w,r_state,collision);
        make_bar(h,w,mutual_info,variation_ratio,combined_confidence);

    
      };

  
      

  
