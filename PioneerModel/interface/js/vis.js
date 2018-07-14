function make_map() {
 
    
    var mmap = d3.select(".map")
                .attr("style","opacity:1.")
                .on("click", function(){
	            //console.log("gfg");
              	    var active  = map.active ? false : true ,
		    newOpacity = active ? 0 : 1;
		    //console.log(active)
                    d3.select(this).style("opacity",newOpacity)
                    map.active = active;
		 });

      
}

function make_bar(h,w,mutual_info,variation_ratio,combined_confidence){
    console.log("bar");
    console.log(combined_confidence);
    var data = [
	{"Label":"Combined Confidence","Value":combined_confidence},
	{"Label":"Variation Ratio","Value":variation_ratio},
        {"Label":"Mutual Information","Value":mutual_info}
        ]

    var margin = {top: 50, right: 20, bottom: 30, left: 120},
	width = 450 - margin.left - margin.right,
	height = 500*2/3 - margin.top - margin.bottom;

    var y = d3.scaleBand()
          .range([height, 0])
          .padding(0.1);

    var x = d3.scaleLinear()
          .range([0, width]);
          

    var svg = d3.select(".uncertainty").append("svg")
                .attr("class","canv")
	        .attr("width", width + margin.left + margin.right)
	        .attr("height", height + margin.top + margin.bottom)
	        .append("g")
	        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain([0, d3.max(data, function(d){ return d.Value; })])
    y.domain(data.map(function(d) { return d.Label; }));

    svg.selectAll(".bar")
       .data(data)
       .enter()
       .append("rect")
       .attr("width", function(d) {return x(d.Value); })
       .attr("y", function(d) { return y(d.Label); })
       .attr("height", 20)
       .attr("fill", function(d,i) {
	                 if (i==0)  return "rgb(50, 205, 50)";
	                 else return "rgb(0, 0, 128)";
	               })
       .on("mousemove", function(d) {
	              var xPosition = d3.mouse(this)[0] ;
            var yPosition = d3.mouse(this)[1] ;
	    console.log(xPosition,yPosition)
                     d3.select("#tooltip")
  		       .style("left", xPosition + "px")
                       .style("top", yPosition + "px")
		       .style("display", "inline-block")
                       .html((d.Label) + "<br>" +(d.Value));
		     d3.select("#tooltip").classed("hidden", false);
        })
        .on("mouseout", function() {d3.select("#tooltip").classed("hidden", true);
	});


    svg.append("g")
       .attr("transform", "translate(" + 0 + ",-" + 25  + ")")
       .call(d3.axisLeft(y));

}



function make_circles(h,w,r_state,collision) {
  
          var opacity = [1.0,0.2,0.2]


          console.log("rstateindic");
          console.log(r_state);
          var robotState = "Inspecting..."
          if (r_state==1){
	     console.log("inindic");

             robotState = "Inspecting..."
             opacity[0] =  0.2
             opacity[1] = 1.0
             opacity[2] = 0.2
          } else if (r_state==2){
  	  console.log("inindic");
             robotState = "I am confused..."
             opacity[0] =  1.0
             opacity[1] = 0.2
             opacity[2] = 0.2
	  }
              if (collision){
		  console.log("col");
             robotState = "Collided!"
             opacity[0] = 0.2
             opacity[1] = 0.2
             opacity[2] = 1.0
          }

    
          var jsonCircles = [
                       { "x_axis": -200, "y_axis": -150 , "radius": 30, "color" : "green", "opacity" :opacity[0] },
                       { "x_axis":  0, "y_axis": -150, "radius": 30, "color" : "yellow", "opacity" :opacity[1]},
                       { "x_axis": 200, "y_axis": -150, "radius": 30, "color" : "red", "opacity" :opacity[2]}];


          var svg = d3.select(".indicator")
 	              //.classed("svg-container", true)
                      .append("svg")
    	              .attr("class","canv")
                      .attr("preserveAspectRatio", "xMinYMin meet")
                      .attr("viewBox", "-270 -450 540 400");
                      //.classed("svg-content-responsive", true);

    
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


          svg.append("text")
             .attr("class", "state")
             .attr("dy", ".35em")
             .attr('x' , -80)
	     .attr('y', -300)
	     .text(robotState)


          d3.select("text.state")
            .transition()
            .duration(1000)
            .on("start", function repeat() {
                     var t = d3.active(this)
                               .style("opacity", 0)
                               .text("Moving...")
                               .transition(t)
                               .style("opacity", 1)
                               .text(robotState)
                               .delay(2000)
            });
   
    
      }
  

function make_pie(w, h, data, unc,val,sAngle,eAngle,id,label,direction) {

    console.log("pie");
    console.log(direction);
        var pie = d3.pie()
                    .sort(null)
                    .value(function(d,i) { return unc[i]; } );

        var arc = d3.arc()
                        .innerRadius(innerRadius)
                        .outerRadius(function (d,i) { 
                            return ((radius - innerRadius) * unc[i]*2 + innerRadius); 
                        })
                        .startAngle(function(d,i) {return sAngle[i];})
                        .endAngle(function(d,i) {return eAngle[i];});

        var svg = d3.select(".piechart")
	            .classed("svg-container", true)
                    .append("svg")
    	            .attr("class","canv")
                    .attr("preserveAspectRatio", "xMinYMin meet")
                    .attr("viewBox", "-270 -500 540 550")
                    .classed("svg-content-responsive", true);

        var arcEnter = svg.selectAll(".solidArc")
                          .data(pie(unc))
                          .enter()
                          .append("g")
                          .classed("solidArc", true)
                          .classed("svg-container", true)
                          .attr("preserveAspectRatio", "xMinYMin meet")
                          .attr("viewBox", "-200 -250 600 640")
                          .classed("svg-content-responsive", true);


        arcEnter.append("path")
                .attr("fill","rgb(120, 197, 120)") 
                .attr("id", function(d,i) {return id[i];})
                .attr("stroke", "gray")
                .attr("d", arc);

    var direct = "Left";

    console.log("ww");
    console.log(direct);
    console.log(direction);
       if (direction==2) {
           direct = "Forward";
	   console.log("in");
        }
        if (direction==0) {
            direct = "Slightly Right";
	    	   console.log("in");

        }
        if (direction==1) {
            direct = "Right";
	    	   console.log("in");

        }

    
        svg.append("text")
           .attr("class", "direction")
           .attr("dy", ".35em")
           .attr("x", -30)
           .attr("y", -430)
           .text(direct);                            
  

 }

function visualise_vsup(data,r_state,collision,direction,mutual_info,variation_ratio,combined_confidence) {
    console.log("vsup");
    console.log(direction);
        var label  = data.map(function(d) { return d.label; });
        var id     = data.map(function(d) { return d.id; });
        var sAngle = data.map(function(d) { return d.startAngle; });
        var eAngle = data.map(function(d) { return d.endAngle; });

        var val = data.map(function(d) { return d.Direction;   });
    var unc = data.map(function(d) { return d.Uncertainty; });
    console.log("sup");
    console.log(val);
    console.log(unc);
    console.log(direction);
        var vDom = d3.extent(data.map(function(d) { return d.Direction; }));
        var uDom = d3.extent(data.map(function(d) { return d.Uncertainty; }));
        var uDomScale = d3.extent(data.map(function(d) { return 1.0-d.Uncertainty; }));
        var simpleScale = d3.scaleQuantize().domain([0,1]).range(d3.quantize(d3.interpolateViridis, 5));

        
        var w = 1280;
        var h = 840;
        radius = 200; //Math.min(w, h) / 3;
        innerRadius = 0.2*radius;

        d3.selectAll("svg.canv").remove();      
        make_pie(w, h, data,unc,val,sAngle,eAngle,id,label,direction);
        make_circles(h,w,r_state,collision);
        make_bar(h,w,mutual_info,variation_ratio,combined_confidence);
        

    
      };

  
      

  
