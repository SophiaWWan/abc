const CUT = 1;
const parts = location.pathname.replace(/\/+$/,'').split('/').filter(Boolean);
// const base  = parts.length ? '/' + parts.slice(0, -CUT).join('/') : ''; // on SERVER...
const base  = parts.length ? parts.slice(0, -CUT).join('/') : '';
console.log(base);
const socket = io({ path: base + '/socket.io' });  // yields '/leon/port-4100/socket.io' or '/socket.io'


// let readyButton = document.querySelector("#ready");
let mainWrapper = document.querySelector(".main-wrapper")
let w = window.innerWidth;
let h = window.innerHeight;
let frogs = []

// socket communication

// here we tell the socket server that we are the conductor
socket.emit("my-role", {role: "conductor"});


//after the server learns taht we are the conductor, 
// it sends us an "all-frogs" messages (that code is in the server file)
// and here we listen for that message to reach us:
socket.on("all-frogs", function(data){
    console.log(data); //
    // once we get info about all current frogs from the server
    // we loop over them (they arrive in the form of an array)
    for(let i = 0; i < data.length; i++){
        // let frog = data[i];
        // and then, in each iteration of the loop
        // we pick out one frog from the array 
        // and add it to the page with the function that
        // is defined further below
        addFrog(data[i].id, data[i].frogIdx);
    }

})


// addFrog("sdfobjweq", 0); // function test

function addFrog(socketID, frogIdx){
    let imgWrapper = document.createElement("div");
    imgWrapper.className = "img-wrap"
    imgWrapper.id = "A" + socketID;
    imgElm = document.createElement("img");
    imgElm.src = "../imgs/frog"+frogIdx+".png";
    imgWrapper.append(imgElm)
    mainWrapper.append(imgWrapper);


    // button socket communication:
    imgElm.addEventListener("click", function(){
        document.querySelector("A"+socketID).style.opacity = 0.3;
        setTimeout(function(){
            document.querySelector("A"+socketID).style.opacity = 1;
        }, 500)

    })
}
