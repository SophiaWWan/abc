const CUT = 1;
const parts = location.pathname.replace(/\/+$/,'').split('/').filter(Boolean);
// const base  = parts.length ? '/' + parts.slice(0, -CUT).join('/') : ''; // on SERVER...
const base  = parts.length ? parts.slice(0, -CUT).join('/') : '';
console.log(base);
let socket;


let readyButton = document.querySelector("#ready");
let mainWrapper = document.querySelector(".main-wrapper")
let w = window.innerWidth;
let h = window.innerHeight;
let audioElm, imgElm;
let frogIdx;


// once page is loaded
// we pick a random frog Idx
// and create the audio and image 
// even if we dont make them visisble yet

window.addEventListener("load", function(){
    console.log("ready");
    
    frogIdx = Math.floor(Math.random()*9); // pick random frog id
    
    console.log(frogIdx);

    audioElm = document.createElement("audio"); // make a sound element (even if it's not visible on the page)
    audioElm.controls = true;
    audioElm.id = "frogSound";
    audioElm.innerHTML = `
        <source src="sounds/f`+frogIdx+`.mp3" type="audio/mpeg">
        Your browser does not support the audio element.
    `
    // mainWrapper.append(audioElm )



    imgElm = document.createElement("img");
    imgElm.src = "../imgs/frog"+frogIdx+".png";
    imgElm.id = "frogImg";
    let frogSize = 0;
    if(w > h){
        frogSize = Math.min(h, 400);

    }else{
        frogSize = Math.min(w, 400);
    }
    imgElm.width = frogSize;
    imgElm.height = frogSize;

    imgElm.addEventListener("click", function(){ //listens for image click
        audioElm.play(); // plays 
    })

    audioElm.addEventListener("timeupdate", function(){
        console.log(imgElm.width)
        imgElm.width = imgElm.width+2;
        imgElm.height = imgElm.height+2;
    })
    audioElm.addEventListener("ended", function(){
        imgElm.width = frogSize;
        imgElm.height = frogSize;
    })

})


// only after we click the button
// will we
// show the images
// hide the button
// conect to the socket server
// send the server our role and frog indexe
// and play the sound for test

readyButton.addEventListener("click", function(){
    mainWrapper.append(imgElm);
    readyButton.remove();

    // connect to socket server
    socket = io({ path: base + '/socket.io' });  

    
    // socket communication
    let data = {
        role: "frog",
        frogIdx: frogIdx
    }
    socket.emit("my-role", data);

    socket.on("make-sound", function(){
        audioElm.play()
    })

   
    // TESTING IF JS CAN PLAY THE AUDIO:
    setTimeout(function(){
        audioElm.play()
    }, 100)
})  