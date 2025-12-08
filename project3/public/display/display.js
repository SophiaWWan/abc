const CUT = 1;
let socket;

let img;
let scaleFactor = 1;
let zoomSpeed = 0.001;


// window.addEventListener("deviceorientation", handleOrientation, true); // can be deleted later
if(location.hostname.toLowerCase().startsWith('browsercircus') || location.hostname.toLowerCase().startsWith('www')){
  socket = io({path: "/sophia/port-4271/display/socket.io"});  // yields '/leon/port-4100/socket.io' or '/socket.io'
}else{
  socket = io(); 
}

socket.emit("my-role", {role: "display"});

let bodyImg, headImg, leftArmImg, rightArmImg, leftLegImg, rightLegImg; 

document.getElementById("shuffleBtn").addEventListener("click", function(){
  socket.emit("shuffle-request");
});

socket.on("randomBodyParts", function(data){
  console.log("reeived randm parts", data)
  console.log("../"+data[0].imgUrl)
  bodyImg = loadImage("../" + data[0].imgUrl);
  headImg = loadImage("../" + data[1].imgUrl);
  leftArmImg = loadImage("../" + data[2].imgUrl);
  rightArmImg = loadImage("../" + data[3].imgUrl);
  leftLegImg = loadImage("../" + data[4].imgUrl);
  rightLegImg = loadImage("../" + data[5].imgUrl);

  // load images for random bosy parts.....
})

// let testImageBody;
// let testImageHead;
// let testImageLeftarm;
// let testImageRightarm;
// let testImageLeftleg;
// let testImageRightleg;

// function preload(){
//   testImageBody = loadImage("../uploads/1764743564198.png")
//   testImageHead = loadImage("../uploads/1764825834081.png")
//   testImageLeftarm = loadImage("../uploads/1764825629068.png")
//   testImageRightarm = loadImage("../uploads/1764825423056.png")
//   testImageLeftleg = loadImage("../uploads/1764824985486.png")
//   testImageRightleg = loadImage("../uploads/1764825629184.png")
// }

function setup() {
  createCanvas(windowWidth ,windowHeight ,WEBGL);
  textPlane = createGraphics(600, 400); 
  textPlane.background(0, 0); 
  textPlane.fill(112, 255, 243);
  textPlane.textSize(30);
  textPlane.text("Swipe and zoom to discover the 3d space!", 50, 50, -100);
}

function draw() {
  background(30);
  angleMode(DEGREES);
  // Style the sphere.
  noStroke();
  fill(247, 222, 153);
  ambientLight(200);
  pointLight(250, 246, 235,50,-400,100);
  shininess(50);
  // metalness(10);
  orbitControl(); 

  // head
  push();
  translate(0, -220, -100);
  // ellipsoid(70,80);
  if(headImg != undefined){
    texture(headImg);
    plane(220, 340);
  }
  
  pop();

  // body
  push();
  translate(0, 0, -100);
  // let bodyWdth
  // ellipsoid(100, 150);
  if(bodyImg != undefined){  
    texture(bodyImg);
    plane(220, 340);
  }
  pop();


  // arm right
  push();
  translate(125,-30,-100);
  // rotate(145);
  // ellipsoid(20, 100);
  if(rightArmImg != undefined){
    texture(rightArmImg);
    plane(220, 340);
  }
  
  pop();
  
  // arm left
  push();
  translate(-125,-30,-100);
  // rotate(-145);
  // ellipsoid(20, 100);
  if(leftArmImg != undefined){ 
    texture(leftArmImg);
    plane(220, 340);
  }

  
  pop();
  
  //left leg
  push();
  translate(-60,220,-100);
  if(leftLegImg != undefined){ 
    texture(leftLegImg);
    plane(220, 340);
  }
  // rotate(10);
  // ellipsoid(30, 130);
  pop();
  //right leg
  push();
  translate(60,220,-100);
  if(rightLegImg != undefined){ 
    texture(rightLegImg);
    plane(220, 340);
  }
  // rotate(-10);
  // ellipsoid(30, 130);
  pop();

  push();
  translate(-30, 250, -100);
  texture(textPlane);
  plane(400, 200);
  pop();

}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}

// function handleOrientation(eventData){
//     console.log(eventData);
//     let beta = eventData.beta;   
//     let gamma = eventData.gamma; 
    
//     let swing = document.querySelector('#swing');
//     swing.style.transform = `rotateZ(${gamma/3}deg) rotateX(${beta/5}deg)`;


//     document.querySelector('#alpha').innerText = "alpha: " + Math.round(eventData.alpha);
//     document.querySelector('#beta').innerText = "beta: " + Math.round(eventData.beta);
//     document.querySelector('#gamma').innerText = "gamma: " + Math.round(eventData.gamma);

//     document.querySelector('h1').style.display = "none";
//     document.querySelector('#requestOrientationButton').style.display = "none";

//     //document.querySelector('#square').style.transform = "rotate("+eventData.alpha+"deg)";
// }







