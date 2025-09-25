const express = require('express');
// const http = require("http");
const https = require("https");
// to read certificates from the filesystem (fs)
const fs = require("fs");

const app = express(); // the server "app", the server behaviour
// const portHTTP = 3000; // port for http
const portHTTPS = 4274; // port for https

// returning to the client anything that is
// inside the public folder
app.use(express.static('public'));


// Creating object of key and certificate
// for SSL
const options = {
    key: fs.readFileSync("localhost-key.pem"),
    cert: fs.readFileSync("localhost.pem"),
};



// Creating servers and make them listen at their ports:
// http.createServer(app).listen(portHTTP, function (req, res) {
//     console.log("HTTP Server started at port", portHTTP);
// });
let HTTPSserver = https.createServer(options, app);

const { Server } = require('socket.io');
const io = new Server(HTTPSserver);

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  // socket.on("message", function(incomingMessage){
  //   console.log("got a msg", incomingMessage)
socket.on("message", function(incomingData){
  io.emit("newMessage", incomingData)

  })

socket.on("disconnect", function(){
    console.log("someone disconnected", socket.id)
})

});

HTTPSserver.listen(portHTTPS, function (req, res) {
    console.log("HTTPS Server started at port", portHTTPS);
});





