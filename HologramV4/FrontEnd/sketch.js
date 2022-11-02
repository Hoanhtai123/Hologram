// WEBSOCKET SERVER URL
let a = 0;
let b = 60.0;
let s = 0.0;  
let mode_target;
let target;
let shift_value = 0.0;
let inconsolata;
var data_from_backend = {
    mode_target: 2,
    target: 0.5
}
function preload(){
    woft = loadModel('3d.obj',true);
    inconsolata = loadFont('Inconsolata-VariableFont_wdth,wght.ttf')
}

function setup() {
  createCanvas(windowWidth, windowHeight,WEBGL);
    // Start a socket connection to the server
  // Some day we would run this server somewhere else
  socket = io.connect('http://localhost:3000');
  // We make a named event called 'mouse' and write an
  // anonymous callback function
  socket.on('ping_from_client',
    // When we receive data
    function(data) {
      console.log("Got: " + data.mode + " " + data.value);
      data_from_backend.mode_target = data.mode;
      data_from_backend.target = data.value;
      data_from_backend.fingers_number = data.fingers_counter;
      // Draw a blue circle
      fill(0,0,255);
      noStroke();
      ellipse(data.x, data.y, 20, 20);
    }
  );
}

function draw() {
  let s = 0.5;  
  if(data_from_backend.mode_target == 1){
    mode = 1;   
  }
  else if(data_from_backend.mode_target == 2){
    mode = 2;
  }
  else if(data_from_backend.mode_target == 3){
    mode = 3;
  }
  if(mode == 1){
    s = data_from_backend.target;
  }
  else if(mode == 2){
    shift_value = data_from_backend.target;
  }
  else if(mode == 3){
    s = data_from_backend.target;
    shift_value = 0;
  }
  // background('LIGHTBLUE')
  background(0)
  // add number to debug -> should be removed
  textFont(inconsolata);
  textSize(50);
  text(data_from_backend.fingers_number, -350, -100); // Text wraps within text box
  
  //up
  push()
  scale(s)
  translate(0+shift_value, -200)
  rotateZ(-PI)
  rotateY(millis() / 1000)
  // rotateX(millis() / 1000)
  normalMaterial()//for colors
  model(woft)
  pop()
  //down
  push()
  scale(s)
  translate(0+shift_value, 200)
  // rotateZ(millis() / 1000)
  rotateY(millis() / 1000)
  // rotateX(millis() / 1000)
  normalMaterial()//for colors
  model(woft)
  pop()
  //right
  push()
  scale(s)
  translate(200+shift_value, 0)
  rotateZ(-PI/2)
  rotateY(millis() / 1000)
  // rotateX(millis() / 1000)
  normalMaterial()//for colors
  model(woft)
  pop()
  //left
  push()
  scale(s)
  translate(-200+shift_value, 0)
  rotateZ(PI/2)
  rotateY(millis() / 1000)
  // rotateX(millis() / 1000)
  normalMaterial()//for colors
  model(woft)
  pop()
}

function mouseDragged() {
    // Draw some white circles
    fill(255);
    noStroke();
    ellipse(mouseX,mouseY,20,20);
    // Send the mouse coordinates
    sendmouse(mouseX,mouseY);
  }

// Function for sending to the socket
function sendmouse(xpos, ypos) {
// We are sending!
console.log("sendmouse: " + xpos + " " + ypos);

// Make a little object with  and y
var data = {
    x: xpos,
    y: ypos
};

// Send that object to the socket
socket.emit('mouse',data);
}
function windowResized(){
    resizeCanvas(windowWidth,windowHeight)
  }


