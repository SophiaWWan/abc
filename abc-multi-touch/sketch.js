let oSize = 30;
let vSize = oSize;
let colorValue = 120;

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("p5-canvas-container");
}

function draw() {
  background(168, 145, 157);

  fill(0);
  ellipse(width/4, height/3, vSize+50, vSize);
  fill(colorValue, 150, 200);
  ellipse(width/4, height/3, vSize, vSize);
  fill(0);
  ellipse(width*3/4, height/3, vSize+50, vSize);
  fill(colorValue, 150, 200);
  ellipse(width*3/4, height/3, vSize, vSize);

  fill(0);
  triangle(width/7, 150, 50-vSize*0.3, 60, 130, 120);
  fill(0);
  triangle(width-width/7, 150, width-50+vSize*0.3, 60, width - 130, 120);
  
  strokeWeight(3);
  line(width/2-70, height/2-40, width/2-150-vSize*0.3, height/2-55);
  line(width/2-70, height/2-40, width/2-150-vSize*0.3, height/2-30);
  line(width/2-70, height/2-40, width/2-150-vSize*0.3, height/2);
  line(width/2+70, height/2-40, width/2+150+vSize*0.3, height/2-55);
  line(width/2+70, height/2-40, width/2+150+vSize*0.3, height/2-30);
  line(width/2+70, height/2-40, width/2+150+vSize*0.3, height/2);
  line(width/2, height/2+10, width/2+30, height/2+30);
  line(width/2, height/2+10, width/2-30, height/2+30);
  line(width/2, height/2+10, width/2, height/2-10);

  fill(0);
  ellipse(width/2, height/2-10, 30, 15);
  
}

//function touchMoved() 
  // Update the grayscale value.
  value += 5;

  // Reset the grayscale value.
  if (value > 255) {
    value = 0;
  }

// P5 touch events: https://p5js.org/reference/#Touch

function touchStarted() {
  console.log(touches);
}

function touchMoved() {
  if (touches.length >= 2) {
    let dx = touches[0].x - touches[1].x;
    let dy = touches[0].y - touches[1].y;
    let distTwoFingers = sqrt(dx*dx + dy*dy);

    let x1 = width/4;
    let x2 = width*3/4;
    let maxvSize = (x2-x1)-80;

    vSize = constrain(distTwoFingers, 30, maxvSize);
    colorValue = map(vSize, 30, maxvSize, 0, 255);
  }

  return false;
}

function touchEnded() {
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}

