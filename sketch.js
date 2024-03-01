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

var LS_val = 0;
var RS_val = 0;
var FS_val = 0;
var BS_val = 0;

var direction = 0;


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
    
    fill('white');
    textSize(16);
    let s_int = 'Intensity: ' + calib_slider.val + ' ';
    text(s_int, windowWidth/2 - 30, windowHeight / 2 - 230, 180, 40);
    
    var s_curr = "";
    
    if(fblr.val){
        if(direction == 0) s_curr = 'Current: ' + RS_val + ' ';
        else if(direction == 1) s_curr = 'Current: ' + FS_val + ' ';
    }
    else{
        if(direction == 0) s_curr = 'Current: ' + RS_val + ' ';
        else if(direction == 1) s_curr = 'Current: ' + LS_val + ' ';
    }
    text(s_curr, windowWidth/2 - 30, windowHeight / 2 - 130, 180, 40);
    
     if (reset.isPressed) {
    // Print a message when Button is pressed.
        console.log("reset");
         moveSetting(0,0);
         
         clearInterval(waveTimer);
          ssine.enabled = true;
         
    }
    
    if (togg_left.isPressed) {
    // Print a message when Button is pressed.
        console.log("send left");
        moveSetting(0,calib_slider.val);      
    }
    
    if (togg_right.isPressed) {
    // Print a message when Button is pressed.
        console.log("send right");
         moveSetting(1,calib_slider.val);
    }
    
    if (ssine.isPressed) {
    // Print a message when Button is pressed.
        console.log("send left");
        //moveSetting(0,calib_slider.val);
       waveTimer =  setInterval(getSample,timeStep);
       ssine.enabled = false;
    }
    
    if (calib_slider.isChanged) {
    // Print a message when Slider is changed
    // that displays its value.
    //print(calib_slider.label + " = " + calib_slider.val);
        //ble_strength = calib_slider.val;
  }
    
    
    
    if(fblr.val){
        togg_left.label = "Forward";
        togg_right.label = "Backward";
        left_slider.val = FS_val;
        right_slider.val = RS_val;
    }
    else{
         togg_left.label = "Left";
        togg_right.label = "Right";
        left_slider.val = LS_val;
        right_slider.val = RS_val;
    }
    
}


function gui_setup(){
    
    gui = createGui();
    gui.loadStyle("Blue");


    togg_left = createButton("Left", windowWidth/2-300, windowHeight / 2 -100, 200, 100);
    togg_right = createButton("Right", windowWidth/2+100, windowHeight / 2 -100, 200, 100);  
    calib_slider = createSlider("Intensity", windowWidth/2 - 150, windowHeight / 2 - 200, 300, 32, 40, 80);
    calib_slider.isInteger = true;
    ble_strength = calib_slider.val;
    
    left_slider = createSliderV("Left_Intensity", windowWidth/2 - 60, windowHeight / 2 - 100, 30, 200, 0, 1000);
    right_slider = createSliderV("Right_Intensity", windowWidth/2 + 30, windowHeight / 2 - 100, 30, 200, 0, 1000);
    
    left_slider.enabled = false;
    right_slider.enabled = false;
    
    ssine = createButton("Sum of Sine", windowWidth/2-300, windowHeight / 2+200, 200, 100);
    reset = createButton("Reset", windowWidth/2+100, windowHeight / 2 +200, 200, 100);  
    
    t1 = createToggle("0.16Hz", windowWidth/2-280, windowHeight / 2 + 60, 50, 50);
    t2 = createToggle("0.33Hz", windowWidth/2-170, windowHeight / 2 + 60, 50, 50);
    t3 = createToggle("0.43Hz", windowWidth/2-280, windowHeight / 2+120, 50, 50);
    t4 = createToggle("0.61Hz", windowWidth/2-170, windowHeight / 2+120, 50, 50);
    
    fblr = createToggle("LR/FB", windowWidth/2+170, windowHeight / 2+120, 50, 50);
    
    smooth = createToggle("Smooth", windowWidth/2+170, windowHeight / 2+60, 50, 50);
    
    t1.setStyle({
    textSize: 14});
    t2.setStyle({
    textSize: 14});
    t3.setStyle({
    textSize: 14});
    t4.setStyle({
    textSize: 14});
    fblr.setStyle({
    textSize: 14});
    smooth.setStyle({
    textSize: 14});
    
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
    
    t1.x = windowWidth / 2 - 280;
    t1.y = windowHeight / 2 + 60;
    
    t2.x = windowWidth / 2 - 170;
    t2.y = windowHeight / 2 + 60;
    
    t3.x = windowWidth / 2 - 280;
    t3.y = windowHeight / 2 + 120;
    
    t4.x = windowWidth / 2 - 170;
    t4.y = windowHeight / 2 + 120;
    
}


//The sum of sines current waveform, with dominant frequencies at 0.16, 0.33, 0.43, 0.61 Hz

var waveTimer = null;

let freq16 = 0.16, freq33 = 0.33 , freq43 = 0.43 , freq61 = 0.61;
 
// Current incrementing sample time 
var sampleTime = 0;

var sample16 = 0, sample33 = 0 ,sample43 = 0,sample61 = 0;
// Timer increment 
let timeStep = 100; // ms



function getSample() {
    
    let amplitude = calib_slider.val - 40;
    // Calculate current sine value 
   
    if (t1.val) sample16 = amplitude * Math.sin(freq16 * sampleTime * (Math.PI * 2));  
    else sample16 = 0;
    
    if (t2.val) sample33 = amplitude * Math.sin(freq33 * sampleTime * (Math.PI * 2));  
    else sample33 = 0;
    
    if (t3.val) sample43 = amplitude * Math.sin(freq43 * sampleTime * (Math.PI * 2));  
    else sample43 = 0;
    
    if (t4.val) sample61 = amplitude * Math.sin(freq61 * sampleTime * (Math.PI * 2));  
    else sample61 = 0;

    // Increment time  
    sampleTime += timeStep/1000; 
    let sample = sample16 + sample33 + sample43 + sample61 ;
    sendSample(sample);
}


function sendSample(sample){
  if(sample >=0){ 
      sinVal = parseInt(sample + 40);
      moveSetting(0,sinVal);
  }
  else{
       sinVal = parseInt(-1*sample + 40);
      moveSetting(1,sinVal);
  }
    
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
  FS_val = readarr[3];
  BS_val = readarr[4];
  //myValue = readarr[6]/256;
}

function writeToBle() {
}


function moveSetting(dir,val){
    direction = dir;
    
    ble_action = 20;
    ble_config = 100;
    ble_location = dir;
    ble_strength = val;
    
    if(fblr.val){
     ble_config = 200;
     ble_location = dir + 2;
    }
    
    if(smooth.val){
        targetIntensity = val;
        ble_strength = baseIntensity;
        smoothTimer = setInterval(smoothBLE,smoothTime);
    }
    else{
        sendBLEPacket();
    }
}


let smoothTime = 50;
var smoothTimer = null;
let stepSize = 5;
let baseIntensity = 40;
var targetIntensity = 80;

function smoothBLE(){
    
    sendBLEPacket();
    
    ble_strength = ble_strength + stepSize;
    
    if(ble_strength >= targetIntensity + stepSize){
        clearInterval(smoothTimer);
    }
   
}


function sendBLEPacket(){

  if(isConnected){
    var sendDataPacket = new Uint8Array([ble_action,ble_config, ble_location, ble_strength]);

    try{
      console.log(sendDataPacket)
      writeCharacteristic.writeValue(sendDataPacket);
      if(elementIndex == 0){
        //socket.send('MoveU_Trigger');
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
    case ',':
          moveSetting(0,calib_slider.val);  
          break;
    case '.':
          moveSetting(1,calib_slider.val);  
          break;
    case 'r':
          moveSetting(0,0);  
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


