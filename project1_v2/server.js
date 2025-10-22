const express = require('express');

const https = require("https");
// to read certificates from the filesystem (fs)
const fs = require("fs");

const app = express(); // the server "app", the server behaviour
const portHTTPS = 4270; // port for https

// returning to the client anything that is
// inside the public folder
app.use(express.static('public'));


// Creating object of key and certificate
// for SSL
const options = {
    key: fs.readFileSync("keys-for-local-https/localhost-key.pem"),
    cert: fs.readFileSync("keys-for-local-https/localhost.pem"),
};

let HTTPSserver = https.createServer(options, app)


const { Server } = require('socket.io'); // include library
const io = new Server(HTTPSserver); // start socket io 


let connectedRooms = [];
let currentCatOwner = undefined;

io.on('connection', function(socket){
    console.log("roomconnected");

    // is any on else already online and owns the cat? 
    if(connectedRooms.length < 1){
        // no one else connected


        // send message to socket to display the cat
        //
        socket.emit("show-cat")



        // assign currentCatOwner
        currentCatOwner = socket.id;




    }


    console.log(socket.id);
    connectedRooms.push(socket.id);
    console.log(connectedRooms);


    socket.on("call-cat", function(){
        io.to(currentCatOwner).emit("hide-cat");
        socket.emit("show-cat");
        currentCatOwner = socket.id;

    })


    socket.on('disconnect', function(){
        console.log("roomdisconnected");
        let idx = connectedRooms.indexOf(socket.id);
        connectedRooms.splice(idx, 1)
        console.log(connectedRooms);
        if(connectedRooms.length == 0){
            currentCatOwner = undefined;
        }
    })

})


// Creating servers and make them listen at their ports:

HTTPSserver.listen(portHTTPS, function (req, res) {
    console.log("HTTPS Server started at port", portHTTPS);
});





