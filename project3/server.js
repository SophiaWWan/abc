const express = require('express');

const https = require("https");
// to read certificates from the filesystem (fs)
const fs = require("fs");

const app = express(); // the server "app", the server behaviour
const portHTTPS = 4270; // port for https
let images = [];

// function getLatestPainterId() {
//     if (images.length === 0) return null;

//     let latest = images.reduce((latest, current) => {
//         return current.time > latest.time ? current : latest;
//     });

//     return latest.userId;
// }

function getRandomBodyParts() {
    // filter imgage by userID and find the current users most recent drawing
    //same userID?
    // const latestPainterId = getLatestPainterId();
    // console.log("Latest painter:", latestPainterId);

    // if(firstLoad){
    //     latestPainter.userId;
    // }
    // body
    let bodies = images.filter(d => d.bodypart == 0);
    let randomBody = bodies[Math.floor(Math.random() * bodies.length)];

    // head
    let heads = images.filter(d => d.bodypart == 1);
    let randomHead = heads[Math.floor(Math.random() * heads.length)];

    //left arm
    let leftarms = images.filter(d => d.bodypart == 2);
    let randomLeftarm = leftarms[Math.floor(Math.random() * leftarms.length)];
    //right arm
    let rightarms = images.filter(d => d.bodypart == 3);
    let randomRightarm = rightarms[Math.floor(Math.random() * rightarms.length)];
    //left leg
    let leftlegs = images.filter(d => d.bodypart == 4);
    let randomLeftleg = leftlegs[Math.floor(Math.random() * leftlegs.length)];
    //right leg
    let rightlegs = images.filter(d => d.bodypart == 5);
    let randomRightleg = rightlegs[Math.floor(Math.random() * rightlegs.length)];

    return [randomBody, randomHead, randomLeftarm, randomRightarm, randomLeftleg, randomRightleg]
}

function getMostRecentBodyPart(){

    let bodyIdxFound = [];
    let bodyParts = [];


    for(let i = images.length-1; i >0; i--){
        let bodyPart = images[i];

        let idx = bodyPart.bodypart;

        // console.log(bodyPart);
        // console.log("idx", idx)

        if(bodyIdxFound.includes(idx)){
            // console.log("skip it!!!!!")
        }else{
            // console.log("we take it")
            bodyIdxFound.push(idx);
            bodyParts.push(bodyPart)
            // console.log("indeces used so far", bodyIdxFound)

            if(bodyIdxFound.length == 6){
                // console.log("we got all body parts");
                
                bodyParts.sort((a, b)=> a.bodypart-b.bodypart)
                // console.log(bodyParts);
                return bodyParts
                break
            }
        }

        // console.log("------")


    }




}


app.post('/upload-photo', (req, res) => {
    console.log("someone upload photo")
    const filename = Date.now() + '.png';     // simple readable filename
    const filepath = 'public/uploads/' + filename;

    const writeStream = fs.createWriteStream(filepath);

    req.pipe(writeStream);

    req.on('end', () => {
        res.json({ url: 'uploads/' + filename });

    });
});

// returning to the client anything that is
// inside the public folder
app.use("/sophia/port-4270", express.static("public"));

// Creating object of key and certificate
// for SSL
const options = {
    key: fs.readFileSync("keys-for-local-https/localhost-key.pem"),
    cert: fs.readFileSync("keys-for-local-https/localhost.pem"),
};

let HTTPSserver = https.createServer(options, app)

const { Server } = require('socket.io'); // include library
// const { timeStamp } = require('console');
const io = new Server(HTTPSserver); // start socket io 



// let bodyparts = [];
// let display;

let DATA_PATH = "image-data.json";
try {
    if (fs.existsSync(DATA_PATH)) {
        const file = fs.readFileSync(DATA_PATH, 'utf8');
        images = JSON.parse(file);
        console.log('Loaded image history:', images.length, 'images');
    }
} catch (err) {
    console.log('Could not load image history, starting empty');
    images = [];
}

io.on('connection', (socket) => {

    // we manage the connection inside here
    console.log('a user connected', socket.id);

    // LISTEN TO
    // client self-reporting role:
    socket.on("my-role", function (data) {
        if (data.role == "painter") {

            //         let bodypartData = {
            //     id: socket.id,
            //     bodyptIdx: data.bodyptIdx 
            // }
            // bodyparts.push({ id: socket.id, bodyptIdx: data.bodyptIdx });
            // console.log(bodyparts);
        } else if (data.role == "display") {
            // display = socket.id;
            console.log("display page loaded");

            let recentBodyParts = getMostRecentBodyPart()
            socket.emit("randomBodyParts", recentBodyParts)
        }
    })

    socket.on("shuffle-request", () => {
        let randomParts = getRandomBodyParts();
        socket.emit("randomBodyParts", randomParts);

        
    });

    socket.on("finish-upload", function (data) {
        console.log("painter uploaded a drawing", data);

        let bodyptinfo = {
            bodypart: data.bodyptIdx,
            imgUrl: data.url,
            userId: data.userId,
            time: data.time
        }
        images.push(bodyptinfo);

        try {
            fs.writeFileSync(DATA_PATH, JSON.stringify(images, null, 2), 'utf-8');
        } catch (e) {
            console.error("Failed to write image data:", e);
        }
        // io.emit("bodyptinfo-from-server", bodyptinfo).to();
    })




    socket.on("disconnect", function () {
        console.log("someone disconnected", socket.id)
        // console.log(bodyparts);

        // let idx = bodyparts.findIndex(function (f) {
        //     return f.id == socket.id
        // });
        // if (idx > -1) {
        //     bodyparts.splice(idx, 1);
        //     console.log(bodyparts);
        // } else if (display == socket.id) {
        //     //if conductor disconnected, conductor socket id variable
        //     display = undefined;
        // }
    })
})


HTTPSserver.listen(portHTTPS, function (req, res) {
    console.log("HTTPS Server started at port", portHTTPS);
});