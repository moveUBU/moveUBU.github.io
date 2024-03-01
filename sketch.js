// Copyright (c) 2024 MIT
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

const serviceUuid = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E";

let writeCharacteristic,notifyCharacteristic;
let myValue = 0;
let myBLE;

var isConnected = 0;
var writeArr = new Uint8Array([20, 0, 0, 0]);

var strength = 0 ;

let r,b,g;

let bcolor = '#228' ;
var introLine = "MoveU!";

let xPos = 0;

var pageCount = 0 ;

// gui
var visible = true;

let gui;

let j;

let x, y, velX, velY;

var gif,pg;

let input;

var vidDuration = 0;

var LS_val = 100;
var RS_val = 100;


const socket = new WebSocket('ws://localhost:8766');

let sockOpen = false

function preload(){
    
    logo = loadImage("assets/logo.png");
    gif = loadImage("assets/back.gif")
}

function setup() {
  // Create a p5ble class
  myBLE = new p5ble();
  r = 120;
  g = 150;
  b = 250;

  createCanvas(windowWidth, windowHeight);
  background(gif);
    
  textSize(32);
  stroke(r, g, b);
  fill(0, 0, 0, 127);

  pg = createGraphics(600, 200);
    
    
  gui_setup();
  
}


function draw() {
    background(gif);
    image(logo,10,10,240,50);
    
    if(isConnected) secondPage(true);
    else firstPage(true);
    
//    if(isConnected && visible){
//        gui.show();
//    }  else {
//        //gui.hide();
//    }
//    

}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    background(gif);
    gui_resize();

    
}

function mousePressed() {
  // Check if mouse is inside the circle
  let d = dist(mouseX, mouseY, windowWidth / 2, windowHeight / 2);
  if (d < 100) {
    // Pick new random color values
//    r = random(255);
//    g = random(255);
//    b = random(255);
    console.log("click");
      
   if(!isConnected) {
    connectToBle();
    }
  }

}


function firstPage(i){
    if(i){
        
    
       stroke(r, g, b);
       fill(r, g, b, 127);
       ellipse(windowWidth / 2, windowHeight / 2, 200, 200);
        
       //strokeWidth(2);
       stroke(0, 0, 0);
       fill(0, 102, 153);
       text("Connect ",windowWidth / 2 - 60, windowHeight / 2 + 5);
       ageCount = 1;
        
    }
}


function secondPage(i){
    if(!i) return ;
    
    gui_interaction();
    
    
    
}

function gui_interaction(){
    drawGui();
    
     if (reset.isPressed) {
    // Print a message when Button is pressed.
        console.log("reset");
         ble_action = 60;
         ble_config = 100;
         ble_location = 0;
         ble_strength = 0;
         sendBLEPacket();
         
    }
    
    if (togg_left.isPressed) {
    // Print a message when Button is pressed.
        console.log("send left");
         ble_action = 20;
         ble_config = 100;
         ble_location = 0;
         ble_strength = calib_slider.val;
        sendBLEPacket();
    }
    
    if (togg_right.isPressed) {
    // Print a message when Button is pressed.
        console.log("send right");
         ble_action = 20;
         ble_config = 100;
         ble_location = 1;
         ble_strength = calib_slider.val;
        sendBLEPacket();
    }
    
    if (calib_slider.isChanged) {
    // Print a message when Slider is changed
    // that displays its value.
    print(calib_slider.label + " = " + calib_slider.val);
        //ble_strength = calib_slider.val;
  }
    
    left_slider.val = LS_val;
    right_slider.val = RS_val;
    
    
}



function gui_setup(){
    
    gui = createGui();
    gui.loadStyle("Blue");


    togg_left = createButton("Left", windowWidth/2-300, windowHeight / 2 -100, 200, 100);
    togg_right = createButton("Right", windowWidth/2+100, windowHeight / 2 -100, 200, 100);  
    calib_slider = createSlider("Intensity", windowWidth/2 - 150, windowHeight / 2 - 200, 300, 32, 40, 100);
    calib_slider.isInteger = true;
    ble_strength = calib_slider.val;
    
    left_slider = createSliderV("Left_Intensity", windowWidth/2 - 60, windowHeight / 2 - 100, 30, 200, 0, 1000);
    right_slider = createSliderV("Right_Intensity", windowWidth/2 + 30, windowHeight / 2 - 100, 30, 200, 0, 1000);
    
    left_slider.enabled = false;
    right_slider.enabled = false;
    
    ssine = createButton("Sum of Sine", windowWidth/2-300, windowHeight / 2+200, 200, 100);
    reset = createButton("Reset", windowWidth/2+100, windowHeight / 2 +200, 200, 100);  
    
}


function gui_resize(){
    
    togg_left.x = windowWidth / 2 - 300;
    togg_left.y = windowHeight / 2 - 100;
    
    
    togg_right.x = windowWidth / 2 + 100;
    togg_right.y = windowHeight / 2 - 100;
    
    calib_slider.x = windowWidth / 2 - 150;
    calib_slider.y = windowHeight / 2 - 200;
    
    left_slider.x = windowWidth / 2 - 60;
    left_slider.y = windowHeight / 2 - 100;
    
    right_slider.x = windowWidth / 2 + 30;
    right_slider.y = windowHeight / 2 - 100;
    
    ssine.x = windowWidth / 2 - 300;
    ssine.y = windowHeight / 2 + 200;
    
    reset.x = windowWidth / 2 + 100;
    reset.y = windowHeight / 2 + 200;
    
}


function connectToBle() {
  // Connect to a device by passing the service UUID
  myBLE.connect(serviceUuid, gotCharacteristics);
}

// A function that will be called once got characteristics
function gotCharacteristics(error, characteristics) {
  if (error) console.log('error: ', error);
  console.log('characteristics: ', characteristics);
  writeCharacteristic = characteristics[0];
  notifyCharacteristic = characteristics[1];
  myBLE.startNotifications(notifyCharacteristic, handleNotifications,'custom');
  isConnected = 1;
  //background(bcolor);
  // You can also pass in the dataType
  // Options: 'unit8', 'uint16', 'uint32', 'int8', 'int16', 'int32', 'float32', 'float64', 'string'
  //myBLE.startNotifications(notifyCharacteristic, handleNotifications, 'int16');
}



var timeIndex = 0
var elementIndex = 0

var ble_action = 20
var ble_config = 100
var ble_location = 0
var ble_strength = 0

function handleNotifications(data) {

  let numVals = data.byteLength/2 ;
  
  var readarr = new Int16Array(numVals);

  for( var i=0; i < numVals; i++){
      readarr[i] = data.getInt16(i*2,true);
  }

  console.log('data: ', readarr);
    
  LS_val = readarr[1];
  RS_val = readarr[2];
  //myValue = readarr[6]/256;
}

function writeToBle() {
}


function sendBLEPacket(){

  if(isConnected){
    var sendDataPacket = new Uint8Array([ble_action,ble_config, ble_location, ble_strength]);

    try{
      console.log(sendDataPacket)
      writeCharacteristic.writeValue(sendDataPacket);
      if(elementIndex == 0){
        socket.send('MoveU_Trigger');
      }
    }
    catch(err){
      isConnected = 0;
    }
  }

}


function uint16(v) {
  return v & 0xFFFF;
}


function typeWriter(sentence, n, x, y, speed) {
  if (n < (sentence.length)) {
    text(sentence.substring(0, n+1), x, y);
    n++;
    setTimeout(function() {
      typeWriter(sentence, n, x, y, speed)
    }, speed);
  }
}

function keyPressed() {
  switch(key) {
    case 'p':
      if(isConnected){
          writeToBle();
      }
          break;
    case 'm':
          videoTrigger();
          break;
    case 'r':
          reset_video();
          break;
    case 'g':
          gui_visible = !gui_visible;
          break;
    case 'c':
          isConnected = 1;
          break;
  }
}


socket.addEventListener('open', function (event) {
    socket.send('MoveU_Hello');
});

// Listen for messages
socket.addEventListener('message', function (event) {

    console.log('Message from server ', event.data);

    if(event.data == "start_stimulus"){
        console.log("starting");
        //videoTrigger();
    }
    else if(event.data == "reset_stimulus"){
        console.log("reset");
        //reset_video();
    }
    else if(event.data == "trigger_device"){
        console.log("trigger");
        writeToBle();
    }
});


