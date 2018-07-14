 // Connecting to ROS
// -----------------


var msg = [];
var data = [
              {"Direction":0,"Uncertainty":0.15,"startAngle":0.26,"endAngle":0.78,"id":"SR","label":"SL right"},
              {"Direction":1,"Uncertainty":0.25,"startAngle":0.78,"endAngle":1.30,"id":"R","label":"Right"},
              {"Direction":2,"Uncertainty":0.15,"startAngle":-0.26,"endAngle":0.26,"id":"F","label":"Forward"},
              {"Direction":3,"Uncertainty":0.45,"startAngle":-0.78,"endAngle":-0.26,"id":"L","label":"Left"}
              
  ];
var opacity = [1.0,0.2,0.2];
var r_state = 0
var collision = 0;
  
var variance_threshold = 0.70;
var direction = 3;
var mutual_info = 30;
var variation_ratio = 10;
var combined_confidence = 50;



function init() {
    
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


// Subscriber for robot pose
var poseTopic = new ROSLIB.Topic({
        ros         : ros,
        name        : '/odom',
        messageType : 'nav_msgs/Odometry'
      });
      // Subscribes to the robot's pose. When rosbridge receives the pose
      // message from ROS, it forwards the message to roslibjs, which calls this
      // callback.
      poseTopic.subscribe(function(message) {
	      message_tmp = message.pose.pose
              message = message_tmp
              // Formats the pose for outputting.
              var now = new Date();
              var position = 'x: ' + message.position.x
                         + ', y: ' + message.position.y
                         + ', z: 0.0';
              var orientation = 'x: ' + message.orientation.x
                            + ', y: ' + message.orientation.y
                            + ', z: ' + message.orientation.z
                            + ', w: ' + message.orientation.w;
      });

// ----------------------------------------------------------------------
// Display the map
// ----------------------------------------------------------------------

// The ROS2D.Viewer is a 2D scene manager with additional ROS functionality.
var viewer2D = new ROS2D.Viewer({
        divID : 'map',
        width : 450,
        height : 350
});

// Subscribes to the robot's OccupancyGrid, which is ROS representation of
// the map, and renders the map in the scene.
var gridClient = new ROS2D.OccupancyGridClient({
                      ros : ros,
                      rootObject : viewer2D.scene
                 });
// Scale the canvas to fit to the map
gridClient.on('change', function() {
        viewer2D.scaleToDimensions(gridClient.currentGrid.width, gridClient.currentGrid.height);
        viewer2D.shift(gridClient.currentGrid.pose.position.x, gridClient.currentGrid.pose.position.y);
        displayPoseMarker();
});

// ----------------------------------------------------------------------
// Showing the pose on the map
// ----------------------------------------------------------------------

function displayPoseMarker() {
        // Create a marker representing the robot.
        var robotMarker = new ROS2D.NavigationArrow({
            size : 14,
            strokeSize : 1,
            fillColor : createjs.Graphics.getRGB(255, 128, 0, 0.66),
            pulse : false
        });
        robotMarker.visible = false;

        // Add the marker to the 2D scene.
        gridClient.rootObject.addChild(robotMarker);
        var initScaleSet = false;

        // Subscribe to the robot's pose updates.
        var poseListener = new ROSLIB.Topic({
          ros : ros,
          name        : '/odom',
          messageType : 'nav_msgs/Odometry',
          throttle_rate : 100
        });
        poseListener.subscribe(function(pose) {
               message_tmp = pose.pose.pose
               pose = message_tmp
               // Orientate the marker based on the robot's pose.
            robotMarker.x = pose.position.x;
            robotMarker.y = -pose.position.y;
               if (!initScaleSet) {
                  robotMarker.scaleX = 1.0 / viewer2D.scene.scaleX;
                  robotMarker.scaleY = 1.0 / viewer2D.scene.scaleY;
                  initScaleSet = true;
               }
            robotMarker.rotation = viewer2D.scene.rosQuaternionToGlobalTheta(pose.orientation);
            robotMarker.visible = true;
        });
      }



 //Subscribing to uncertainty topic
 //----------------------
 var listener = new ROSLIB.Topic({
    ros : ros,
    name : '/uncertain',
    messageType : 'p3dx_description/UncertainMsg'
 });




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
    console.log(direction);
        var mutual_info = message.UncertainList[7];
        var variation_ratio = message.UncertainList[6];
        var combined_confidence = message.UncertainList[5];

    
       			       
        if (msg !== undefined) {
           if (msg.length != 0) {
            data[0].Uncertainty = msg[0];      
            data[1].Uncertainty = msg[1];      
            data[2].Uncertainty = msg[2];      
            data[3].Uncertainty = msg[3];      
           }
        }
       
        console.log(msg);
    
        visualise_vsup(data, r_state, collision,direction, mutual_info,variation_ratio,combined_confidence);
           
});

}
