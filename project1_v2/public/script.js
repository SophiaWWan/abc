const CUT = 1;
const parts = location.pathname.replace(/\/+$/,'').split('/').filter(Boolean);
// const base  = parts.length ? '/' + parts.slice(0, -CUT).join('/') : ''; // on SERVER...
const base  = parts.length ? parts.slice(0, -CUT).join('/') : '';
console.log(base);
let socket;


let readyButton = document.querySelector("#ready");
let mainWrapper = document.querySelector(".main-wrapper")
let w = window.innerWidth; // get the width of the window (screen)
let h = window.innerHeight; // get the height of the window (screen)
let audioElm, imgElm; // empty global variables
//?
let foodbtn;
let roomIdx;
let incomingCat, leavingCat;
const incomingCatSources = [
    "imgs/walkingcat0.png",
    "imgs/walkingcat1.png",
    "imgs/walkingcat2.png",
    "imgs/walkingcat3.png",
    "imgs/walkingcat4.png",
    "imgs/walkingcat5.png",
    "imgs/walkingcat6.png",
    "imgs/walkingcat7.png",
    "imgs/walkingcat8.png",
    "imgs/walkingcat9.png",
    "imgs/walkingcat10.png",
]
const leavingCatSources = [
    "imgs/walkingcat0.png",
    "imgs/walkingcat1.png",
    "imgs/walkingcat2.png",
    "imgs/walkingcat3.png",
    "imgs/walkingcat4.png",
    "imgs/walkingcat5.png",
    "imgs/walkingcat6.png",
    "imgs/walkingcat7.png",
    "imgs/walkingcat8.png",
    "imgs/walkingcat9.png",
    "imgs/walkingcat10.png",
]
 const frameDuration = 300;
 let currentFrame = 0;

// socket communication

// here we tell the socket server that we are which rooms
//socket.emit("my-role", {role: "diningroom"});

// once page is loaded
// we pick a random frog Idx
// and create the audio and image 
// even if we dont make them visisble yet\




window.addEventListener("load", function(){ // event listener for content that has loaded
    console.log("ready");
    
    roomIdx = Math.floor(Math.random()*3); // pick random frog id
    
    console.log(roomIdx);

    audioElm = document.createElement("audio"); // make a sound element (even if it's not visible on the page)
    audioElm.controls = true;
    audioElm.id = "catSound";

    //make the audio thing later

    if(roomIdx == 0){
        audioElm.innerHTML = `
            <source src="sounds/eat.wav" type="audio/mpeg">
            Your browser does not support the audio element.
        `

    }else if(roomIdx == 1){
        audioElm.innerHTML = `
            <source src="sounds/play.mp3" type="audio/mpeg">
            Your browser does not support the audio element.
        `
 

    }else if(roomIdx == 2){
        audioElm.innerHTML = `
            <source src="sounds/sleep.wav" type="audio/mpeg">
            Your browser does not support the audio element.
        `
     
    }

    


    // not needed:
    // mainWrapper.append(audioElm )



 
    imgElm = document.createElement("img"); // create image but dont see it on the page yet
    foodbtn = document.createElement("img"); // create image but dont see it on the page yet
    foodbtn.id = "callcatbtn";
    incomingCat = document.createElement("img");
    incomingCat.id = "incomingCat";
    leavingCat = document.createElement("img");
    leavingCat.id = "leavingCat";


    if(roomIdx == 0){
        imgElm.src = "imgs/diningroom1.PNG";
        foodbtn.src = "imgs/eatbtn.png";

    }else if(roomIdx == 1){
        imgElm.src = "imgs/playroom1.PNG";
        foodbtn.src = "imgs/playbtn.png";

    }else if(roomIdx == 2){
        imgElm.src = "imgs/sleeproom1.PNG";
        foodbtn.src = "imgs/sleepbtn.png";

    }
    
    
    foodbtn.addEventListener("click", function(){
        console.log("show");

        socket.emit("call-cat");
    })
    
    
    //where to put diningroom2
    imgElm.id = "roomImg";
    let roomSize = 0;
    if(w > h){
        roomSize = Math.min(h, 400);
        imgElm.height = roomSize;
        foodbtn.style.right = "20px";

    }else{
        roomSize = Math.min(w, 400);
        imgElm.width = roomSize;
    }
    
    // imgElm.height = roomSize;

    // imgElm.addEventListener("click", function(){ //listens for image click
    //     audioElm.play(); // plays 
    // })

    // audioElm.addEventListener("timeupdate", function(){
    //     console.log(imgElm.width)
    //     imgElm.width = imgElm.width+2;
    //     imgElm.height = imgElm.height+2;
    // })
    // audioElm.addEventListener("ended", function(){
    //     imgElm.width = roomSize;
    //     imgElm.height = roomSize;
    // })

})


// only after we click the button
// will we
// show the images
// hide the button
// conect to the socket server
// send the server our role and frog indexe
// and play the sound for test

readyButton.addEventListener("click", function(){ // event listenr waiting for button click
    mainWrapper.append(imgElm); // puttng the image we loaded in JS space abve into the main wrappeer
     mainWrapper.append(foodbtn);
     mainWrapper.append(incomingCat);
     mainWrapper.append(leavingCat);
    readyButton.remove(); // removing thebutton

    // connect to socket server
    socket = io({ path: base + '/socket.io' });  
    socket.on("show-cat", function(){
        console.log("showcat");
        showIncomingCats();
        setTimeout(function(){

            showRoomWithCat()
            playSound();

        }, 3600);

    })
    socket.on("hide-cat", function(){
        showRoomWithoutCat();
        showLeavingCats();
        stopSound();
    })
    
    // socket communication
    // let data = {
    //     role: "diningroom",
    //     roomIdx: roomIdx
    // }
    // socket.emit("my-role", data);

    // socket.on("make-sound", function(){
    //     audioElm.play()
    // })

   
    // TESTING IF JS CAN PLAY THE AUDIO:
    // setTimeout(function(){
    //     audioElm.play()
    // }, 100)
})  


function showIncomingCats(){
    incomingCat.src = incomingCatSources[currentFrame];
    incomingCat.style.display = "block";
    currentFrame++;
    if (currentFrame < incomingCatSources.length) {
        setTimeout(showIncomingCats, frameDuration)
    } else {
        currentFrame = 0; // reset current frame to 0 and prepare for the next round
            incomingCat.style.display = "none"}
}

// function hideIncomingCat(){
//     incomingCat.style.display = "none";

// }

function showLeavingCats(){
    leavingCat.src = leavingCatSources[currentFrame];
    leavingCat.style.display = "block";
    currentFrame++;
    if (currentFrame < leavingCatSources.length) {
        setTimeout(showLeavingCats, frameDuration)
    } else {
        currentFrame = 0; // reset current frame to 0 and prepare for the next round
            leavingCat.style.display = "none"}

}

function hideLeavingCat(){
    leavingCat.style.display = "none";

}

function showRoomWithCat(){
    if(roomIdx == 0){
        imgElm.src = "imgs/diningroom2.PNG";
        // audioElm.play();
    }else if(roomIdx == 1){
        imgElm.src = "imgs/playroom2.PNG";
        // audioElm.play();
    }else if(roomIdx == 2){
        imgElm.src = "imgs/sleeproom2.PNG";
        // audioElm.play();
    }
    playSound();
}

function showRoomWithoutCat(){

    if(roomIdx == 0){
        imgElm.src = "imgs/diningroom1.PNG";
    }else if(roomIdx == 1){
        imgElm.src = "imgs/playroom1.PNG";
    }else if(roomIdx == 2){
        imgElm.src = "imgs/sleeproom1.PNG";
    }
    
}

function playSound(){
    audioElm.play();
}
function stopSound(){
    audioElm.pause();
    audioElm.currentTime = 0;
}



window.addEventListener("keypress", function(e){
    console.log(e.key)
    if(e.key == "s"){
        showIncomingCats(); 
    }
    if(e.key == "a"){
        hideIncomingCat(); 
    }
    if(e.key == "q"){
        showLeavingCats(); 
    }
    if(e.key == "r"){
        hideLeavingCat(); 
    }

    if(e.key == "g"){
        showRoomWithCat(); 
    }
    if(e.key == "f"){
        showRoomWithoutCat(); 
    }


})
