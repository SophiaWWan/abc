let mappa = new Mappa('Leaflet'); // map library
let myMap;
let canvas;
let currentLongitude = 0; // global variables will be updated as we get GPS data
let currentLatitude = 0; // global variables will be updated as we get GPS data
let mapInit = false; // we only do map stuff once mapInit is true (see in draw)
let me; // point object showing our own location
let socket = io();

let cameras = [];
// let lines = [];


// options for map
// we only actually initialize the map once we get data where we are (in draw)
// there are differnt suppliers and styles of maps available
let mappa_options = {
  lat: 0, // will change once we have data
  lng: 0, // will change once we have data
  zoom: 16, // initial zoom level
  // style: "https://b.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png"
  // style: "https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
  style: 'https://webst01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=6&x={x}&y={y}&z={z}',
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("p5-canvas-container");
  me = new MyPoint();

}

function draw() {
  clear();

  // Initialize full screen map
  if (!mapInit && GPS_GRANTED && currentLongitude != 0) {
    console.log("starting map");
    mappa_options.lat = currentLatitude;
    mappa_options.lng = currentLongitude;
    // mappa_options.lat = 31.798695;
    // mappa_options.lng = 119.900453;
    myMap = mappa.tileMap(mappa_options);
    myMap.overlay(canvas);
    myMap.onChange(updateMapContent);
    mapInit = true
  }

  if (mapInit) {

    for (let i = 0; i < cameras.length; i++) {
      let c = cameras[i];

      let d = getDistanceFromLatLonInM(currentLatitude, currentLongitude, c.lat, c.lng);
      if (d < 100) {
        stroke(0, 0, 255);
        strokeWeight(1);
        line(me.x, me.y, c.x, c.y);
      }

    }


    // only update and draw our point if we actually have data
    me.update();
    me.display();
    // console.log(me)



  }

  for (let i = 0; i < cameras.length; i++) {
    let c = cameras[i];
    //from location to screen pixel
    let camPos = myMap.latLngToPixel(c.lat, c.lng);
    
    // noStroke();
    // circle(camPos.x, camPos.y, 20);
    // triangle(camPos.x-7.45, camPos.y+6.67, camPos.x+7.45, camPos.y+6.67, camPos.x, camPos.y+17);
    // fill(220);
    // circle(camPos.x, camPos.y, 16);
    //camera
    // fill(50);          
    // rectMode(CENTER);  
    // rect(camPos.x, camPos.y, 12, 9, 2); 
    // rect(camPos.x+2, camPos.y-5, 4, 2, 0.2); 
    // stroke(200);
    // strokeWeight(0.8);
    // circle(camPos.x, camPos.y, 4.5);
    // noFill();

    //eye
    let camVector = createVector(camPos.x, camPos.y);
    let targetVector = createVector(me.x, me.y);
    let moveeye = p5.Vector.sub(targetVector, camVector);
    stroke(0);
    fill(150,7,7);
    curve(camPos.x-5, camPos.y-60, camPos.x-12, camPos.y, camPos.x+12, camPos.y, camPos.x+5, camPos.y-50);
    curve(camPos.x-5, camPos.y+60, camPos.x-12, camPos.y, camPos.x+12, camPos.y, camPos.x+5, camPos.y+50);

    moveeye.limit(2.5);
    push();
    let pupilX = moveeye.x;
    let pupilY = moveeye.y;
     fill(0);
     noStroke();
     translate(camPos.x, camPos.y);
     circle(pupilX, pupilY, 10);
     fill(180);
     circle(pupilX+1, pupilY+1, 3);
    pop();
  }



}

socket.on("camera-from-server", (data) => {
  cameras.push({
    lat: data.lat,
    lng: data.lng
  })
})

// P5 touch events: https://p5js.org/reference/#Touch
function touchStarted() {
  if (mapInit) {
    //from screen pixel to location
    let pos = myMap.pixelToLatLng(touches[0].x, touches[0].y);
    console.log("TOUCHED", pos);
    cameras.push({
      lat: pos.lat,
      lng: pos.lng
    })
    socket.emit("camera-from-client", {
      lat: pos.lat,
      lng: pos.lng
    })


  } else {
    console.log("TOUCHED", touches);
  }

}

function touchMoved() {
}

function touchEnded() {
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

//directly called from GPS listener whenever our location updates;
function handleNewPosition(pos) {
  // fix location for chinese map tiles
  let lonlat = fixForChineseMap(pos);
  currentLongitude = lonlat[0];
  currentLatitude = lonlat[1];
  console.log(currentLatitude, currentLongitude);
  if (mapInit) {
    // if map already displayed, update the point
    updateMapContent();
  }
  let locForSer = {
    lat: currentLatitude, lng: currentLongitude
  }
  socket.emit("location-from-client", { locForSer });
}

socket.on("location-from-server", function (data) {
  console.log("other location", data);

})




function updateMapContent() {
  let myPosOnCanvas = myMap.latLngToPixel(currentLatitude, currentLongitude)
  me.goalX = myPosOnCanvas.x;
  me.goalY = myPosOnCanvas.y;

  //update the camera locations
  for (let i = 0; i < cameras.length; i++) {
    let c = cameras[i];
    let camPixel = myMap.latLngToPixel(c.lat, c.lng);
    c.x = camPixel.x;
    c.y = camPixel.y;
  }
}

class MyPoint {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.goalX = 0;
    this.goalY = 0;
    this.size = 14;
    this.col = color(170, 240, 255);

  }
  update() {
    // lerp to each new location to keep things smoother
    this.x = lerp(this.x, this.goalX, 0.2)
    this.y = lerp(this.y, this.goalY, 0.2)

  }
  display() {
    push();
    translate(this.x, this.y);
    fill(this.col);
    // stroke("pink");
    noStroke();
    let dia = this.size + sin(frameCount * 0.1)
    circle(0, 0, dia);

    pop();
  }
}

function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
  const R = 6371000; // radius of the earch
  const dLat = radians(lat2 - lat1);
  const dLon = radians(lon2 - lon1);
  const a =
    sin(dLat / 2) * sin(dLat / 2) +
    cos(radians(lat1)) * cos(radians(lat2)) *
    sin(dLon / 2) * sin(dLon / 2);
  const c = 2 * atan2(sqrt(a), sqrt(1 - a));
  return R * c; 
}