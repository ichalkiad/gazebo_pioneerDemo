 // Connecting to ROS
 // -----------------
 var ros = new ROSLIB.Ros();

 // If there is an error on the backend, an 'error' emit will be emitted.
 ros.on('error', function(error) {
    document.getElementById('connecting').style.display = 'none';
    document.getElementById('connected').style.display = 'none';
    document.getElementById('closed').style.display = 'none';
    document.getElementById('error').style.display = 'inline';
    console.log(error);
 });

 // Find out exactly when we made a connection.
 ros.on('connection', function() {
    console.log('Connection made!');
    document.getElementById('connecting').style.display = 'none';
    document.getElementById('error').style.display = 'none';
    document.getElementById('closed').style.display = 'none';
    document.getElementById('connected').style.display = 'inline';
 });

 ros.on('close', function() {
    console.log('Connection closed.');
    document.getElementById('connecting').style.display = 'none';
    document.getElementById('connected').style.display = 'none';
    document.getElementById('closed').style.display = 'inline';
 });

 // Create a connection to the rosbridge WebSocket server.
 ros.connect('ws://localhost:9090');

 //Subscribing to  Topic
 //----------------------
 var listener = new ROSLIB.Topic({
    ros : ros,
    name : '/uncertain',
    messageType : 'p3dx_description/UncertainMsg'
 });



var msg = [];
var data = [
              {"Direction":3,"Uncertainty":0.45,"startAngle":-0.78,"endAngle":-0.26,"id":"L","label":"Left"},
              {"Direction":2,"Uncertainty":0.15,"startAngle":-0.26,"endAngle":0.26,"id":"F","label":"Forward"},
              {"Direction":0,"Uncertainty":0.15,"startAngle":0.26,"endAngle":0.78,"id":"SR","label":"SL right"},
              {"Direction":1,"Uncertainty":0.25,"startAngle":0.78,"endAngle":1.30,"id":"R","label":"Right"}
  ];
var opacity = [1.0,0.2,0.2];
var r_state = 0
var collision = 0;
  
var variance_threshold = 0.70;
var direction = 3;
var mutual_info = 30;
var variation_ratio = 10;
var combined_confidence = 50;


// Callback to be called every time a message is published on this topic.
listener.subscribe(function(message) {

        console.log('Received message on ' + listener.name + ': ' + message.UncertainList);
        msg[0] = message.UncertainList[0];
        msg[1] = message.UncertainList[1];
        msg[2] = message.UncertainList[2];
        msg[3] = message.UncertainList[3];

       
        var collision = message.UncertainList[4]; //binary
        var r_state = message.UncertainList[8];
        var direction = message.UncertainList[9];
        var mutual_info = message.UncertainList[7];
        var variation_ratio = message.UncertainList[6];
        var combined_confidence = message.UncertainList[5];

    
        var data = [
              {"Direction":3,"Uncertainty":0.35,"startAngle":-0.78,"endAngle":-0.26,"id":"L","label":"Left"},
              {"Direction":2,"Uncertainty":0.15,"startAngle":-0.26,"endAngle":0.26,"id":"F","label":"Forward"},
              {"Direction":0,"Uncertainty":0.25,"startAngle":0.26,"endAngle":0.78,"id":"SR","label":"SL right"},
              {"Direction":1,"Uncertainty":0.25,"startAngle":0.78,"endAngle":1.30,"id":"R","label":"Right"}
        ];

				       
        if (msg !== undefined) {
           if (msg.length != 0) {
            data[0].Uncertainty = msg[3];      
            data[1].Uncertainty = msg[2];      
            data[2].Uncertainty = msg[0];      
            data[3].Uncertainty = msg[1];      
           }
        }
       
        console.log(msg);
    
        visualise_vsup(data, r_state, collision,direction, mutual_info,variation_ratio,combined_confidence);
           
});
