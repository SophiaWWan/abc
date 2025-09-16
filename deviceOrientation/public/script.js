

// window.addEventListener("deviceorientation", handleOrientation, true); // can be deleted later


function handleOrientation(eventData){
    console.log(eventData);
    let beta = eventData.beta;   
    let gamma = eventData.gamma; 
    
    let swing = document.querySelector('#swing');
    swing.style.transform = `rotateZ(${gamma/3}deg) rotateX(${beta/5}deg)`;


    document.querySelector('#alpha').innerText = "alpha: " + Math.round(eventData.alpha);
    document.querySelector('#beta').innerText = "beta: " + Math.round(eventData.beta);
    document.querySelector('#gamma').innerText = "gamma: " + Math.round(eventData.gamma);

    document.querySelector('h1').style.display = "none";
    document.querySelector('#requestOrientationButton').style.display = "none";

    //document.querySelector('#square').style.transform = "rotate("+eventData.alpha+"deg)";
}







