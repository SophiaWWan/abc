function getOrCreateUserId() {
  // check if we have a userID already in local storage
  // if yes, return it
  // if not, create one and return it
  let id = localStorage.getItem("chat-user-id");
  if (id == undefined) {
    id = 'u-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
    localStorage.setItem("chat-user-id", id);
  }
  return id;
}
const myUserId = getOrCreateUserId();

const now = new Date();
const uploadTime = now.toISOString();
console.log('My userId:', myUserId);


const CUT = 1;

let socket;
if (location.hostname.toLowerCase().startsWith('browsercircus') || location.hostname.toLowerCase().startsWith('www')) {
  socket = io({ path: "/sophia/port-4270/socket.io" });  // yields '/leon/port-4100/socket.io' or '/socket.io'
} else {
  socket = io();
}

let img;
let readyButton = document.querySelector("#ready");
let bodyptIdx = -1;
let isErasing = false;
let isWaterpaint = false;
let isDrafting = false;
let hasUploaded = false;
let pg;
let sendButton = document.querySelector("#sendButton");
let eraserButton = document.querySelector("#eraserButton");

// window.addEventListener("deviceorientation", handleOrientation, true); // can be deleted later

// Click and drag the mouse to view the scene from different angles.


function setup() {
  createCanvas(windowWidth, windowHeight);
  background(240);
  angleMode(DEGREES);
  pg = createGraphics(windowWidth, windowHeight);
}

window.addEventListener("load", function () { // event listener for content that has loaded
  console.log("ready");

})

// readyButton.addEventListener("click", function(){ // event listenr waiting for button click
// readyButton.remove(); // removing thebutton
// socket = io({ path: base + '/socket.io' });  
bodyptIdx = Math.floor(Math.random() * 6); // pick random frog id
// bodyptIdx = 0; 

console.log(bodyptIdx);

let data = {
  role: "painter",
  bodyptIdx: bodyptIdx
}
socket.emit("my-role", data);
console.log(data);
// }) 

// function mouseDragged(){
//     pg.stroke(0);
//     pg.strokeWeight(10);
//     pg.line(pmouseX, pmouseY, mouseX, mouseY);
// }
eraserButton.addEventListener("click", function () {
  if (isErasing) {
    isErasing = false;
    isWaterpaint = true;
    isDrafting = false;
    eraserButton.innerText = "BrushA";
  } else if (isWaterpaint) {
    isErasing = false;
    isWaterpaint = false;
    isDrafting = true;
    eraserButton.innerText = "Eraser";
  } else {
    isErasing = true;
    isWaterpaint = false;
    isDrafting = false;
    eraserButton.innerText = "BrushB";
  }
})

function touchStarted() {
  console.log(touches);
}

function touchMoved() {
  for (let touch of touches) {
    if (isErasing) {
      pg.erase();
      pg.fill(240);
      pg.noStroke();
      pg.circle(touch.x, touch.y, 50);
      pg.noErase();
    } else if (isWaterpaint) {
      waterpaint(touch.x, touch.y);
    } else {
      pg.stroke(171, 171, 169);
      pg.strokeWeight(5);
      pg.line(touch.x, touch.y, touch.x - 10, touch.y - 10);
    }
  }
  return false;
}

// function touchEnded() {
// }
function waterpaint(x, y) {
  let alpha = 20;
  let size = random(20, 35);
  let density = 5;

  for (let i = 0; i < density; i++) {
    let offsetX = random(-size / 2, size / 2);
    let offsetY = random(-size / 2, size / 2);
    let radius = random(size * 0.3, size);
    pg.noStroke();
    pg.fill(143, 246, 247, alpha);
    pg.ellipse(x + offsetX, y + offsetY, radius, radius);
  }
}

function draw() {
  // background(240);
  noStroke();
  push();
  fill(240);
  rect(0, 0, width * 2, height * 2);
  pop();

  if (bodyptIdx == 0) {
    showmainbd();
  } else if (bodyptIdx == 1) {
    showhead();
  } else if (bodyptIdx == 2) {
    showleftarm();
  } else if (bodyptIdx == 3) {
    showrightarm();
  } else if (bodyptIdx == 4) {
    showleftleg();
  } else if (bodyptIdx == 5) {
    showrightleg();
  }
  image(pg, 0, 0);
  fill(252, 56, 207);
  rectMode(CENTER);
  rect(width / 2, 640, 320, 35);
  fill(53, 31, 242);
  textSize(18);
  textAlign(CENTER, CENTER);
  text("Draw a speculative future body part!", width / 2, 640);
}

sendButton.addEventListener("click", function () {
  if (!hasUploaded) {
    //before the image is sent to uploads
    sendButton.innerText = "Uploading...";
    pg.elt.toBlob(sendImageToServer, 'image/png');

  }
})



function sendImageToServer(blob) {
  console.log(blob);
  fetch('../upload-photo', {
    method: 'POST',
    headers: { 'Content-Type': 'image/png' }, // or jpg
    body: blob
  })
    .then(r => r.json())
    .then(data => {
      console.log("URL:", data.url);

      // could send that URL to socket server here manually
      // here is important

      // could also append as img
      // let album = document.querySelector("#album");
      // let img = document.createElement("img");
      // let images = album.querySelector("#images")
      // img.src = data.url;
      // images.prepend(img);
      // album.style.display = "block";
      socket.emit("finish-upload", {
        bodyptIdx: bodyptIdx,
        url: data.url,
        userId: myUserId,
        time: uploadTime
      });
      hasUploaded = true;

      gotodisplay();


    });
}

function gotodisplay() {
  window.location.href = "../display/index.html";
}

function showmainbd() {
  push();
  translate(0, -320);
  fill(171, 171, 169);
  drawhead();
  drawleftarm();
  drawrightarm();
  drawleftleg();
  drawrightleg();
  fill(247, 222, 153);
  drawmainbd();
  pop();
}
function showhead() {
  push();
  translate(0, 100);
  fill(171, 171, 169);
  drawmainbd();
  drawleftarm();
  drawrightarm();
  drawleftleg();
  drawrightleg();
  fill(247, 222, 153);
  drawhead();
  pop();
}
function showleftarm() {
  push();
  translate(200, -300);
  fill(171, 171, 169);
  drawmainbd();
  drawhead();
  drawrightarm();
  drawleftleg();
  drawrightleg();
  fill(247, 222, 153);
  drawleftarm();
  pop();
}
function showrightarm() {
  push();
  translate(-200, -300);
  fill(171, 171, 169);
  drawmainbd();
  drawhead();
  drawleftarm();
  drawleftleg();
  drawrightleg();
  fill(247, 222, 153);
  drawrightarm();
  pop();
}
function showleftleg() {
  push();
  translate(100, -700);
  fill(171, 171, 169);
  drawmainbd();
  drawhead();
  drawleftarm();
  drawrightarm();
  drawrightleg();
  fill(247, 222, 153);
  drawleftleg();
  pop();
}
function showrightleg() {
  push();
  translate(-100, -700);
  fill(171, 171, 169);
  drawmainbd();
  drawhead();
  drawleftarm();
  drawrightarm();
  drawleftleg();
  fill(247, 222, 153);
  drawrightleg();
  pop();
}

function drawhead() {
  push();
  stroke(240);
  strokeWeight(5);
  ellipse(width / 2, 200, 280, 320);
  pop();
}
function drawmainbd() {
  push();
  ellipse(width / 2, 640, 370, 600);
  pop();
}
function drawleftarm() {
  push();
  translate(width / 2 - 180, 600);
  rotate(20);
  stroke(240);
  strokeWeight(5);
  ellipse(0, 0, 100, 400);
  pop();
}
function drawrightarm() {
  push();
  translate(width / 2 + 180, 600);
  rotate(-20);
  stroke(240);
  strokeWeight(5);
  ellipse(0, 0, 100, 400);
  pop();
}
function drawleftleg() {
  push();
  translate(width / 2 - 100, 1050);
  rotate(5);
  ellipse(0, 0, 120, 400);
  pop();
}
function drawrightleg() {
  push();
  translate(width / 2 + 100, 1050);
  rotate(-5);
  ellipse(0, 0, 120, 400);
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}








