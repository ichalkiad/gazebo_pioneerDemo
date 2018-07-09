  function visualise_vsup(data,r_state,collision,direction) {

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
        

        var body = d3.select("body");

        var w = 1280;
        var h = 840;
        radius = Math.min(w, h) / 3,
        innerRadius = 0.2*radius;

        d3.selectAll("svg.canvas").remove();      
        makeVSUP(w, h, scale, simpleScale, data, "simple",unc,val,sAngle,eAngle,id,label,r_state,collision,direction);

      };

  
      function makeVSUP(w, h, scale, simpleScale, data, type, unc,val,sAngle,eAngle,id,label,r_state,collision,direction) {
                 
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

          var svg = d3.select("body").append("svg")
                                   .attr("class","canvas")
                                   .attr("width", w)
                                   .attr("height", h)
                                   .append("g")
                                   .attr("transform", "translate("+w/2+","+h/2+")");

        var arcEnter = svg.selectAll(".solidArc")
                          .data(pie(unc))
                          .enter().append("g")
                          .classed("solidArc", true)
                          .attr("transform", "translate(-"+w/20+","+h/2+")");

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
  
     
       create_circles(svg,h,w,r_state,collision);     

 }

  function create_circles(svg,h,w,r_state,collision) {
  
        var opacity = [1.0,0.2,0.2]

//x: 50,250,450
          console.log(opacity)
          var jsonCircles = [
                       { "x_axis": -200, "y_axis": -150 , "radius": 30, "color" : "green", "opacity" :opacity[0] },
                       { "x_axis":  0, "y_axis": -150, "radius": 30, "color" : "yellow", "opacity" :opacity[1]},
                       { "x_axis": 200, "y_axis": -150, "radius": 30, "color" : "red", "opacity" :opacity[2]}];

    
          var circles = svg.selectAll("circle")
                           .data(jsonCircles)
                           .enter()
                           .append("circle");

  

          var circleAttributes = circles
                       .attr("cx", function (d) { return d.x_axis; })
                       .attr("cy", function (d) { return d.y_axis; })
                       .attr("r", function (d) { return d.radius; })
                       .style("fill", function(d) { return d.color; })
                       .style("opacity", function(d) { return d.opacity; });

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
          svg.append("text")
             .attr("class", "state")
             .attr("dy", ".35em")
             .attr("transform","translate("+"-"+50+",-"+250+")")
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
  
