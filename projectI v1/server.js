const express = require('express');
const https = require("https");
const fs = require("fs");
const app = express();
const portHTTPS = 4270; 

// 静态文件服务设置：修正回 'public'，以匹配您的文件结构
app.use(express.static('public'));

// SSL options
const options = {
    key: fs.readFileSync("keys-for-local-https/localhost-key.pem"),
    cert: fs.readFileSync("keys-for-local-https/localhost.pem"),
};

let HTTPSserver = https.createServer(options, app)
const { Server } = require('socket.io'); 
const io = new Server(HTTPSserver); 

// Game status variables
let students = []; // Added studyTime and favoriteSentence
let teacherSocketId = null; // Track teacher connection

// Cat Type Configuration (Must match client configuration)
const CAT_TYPES = ['Scat', 'Acat', 'Bcat'];
const STATUS_ACTIONS = [
    { key: 'studying', dialogue: "I'm focusing hard on my books!", chinese: '我在认真学习！' },
    { key: 'bathing', dialogue: "Time for a lovely bubble bath!", chinese: '洗个香香澡！' },
    { key: 'eating', dialogue: "Yummy food time! So delicious!", chinese: '开饭啦，真香！' },
    { key: 'sports', dialogue: "Exercise keeps me healthy and happy!", chinese: '运动使我健康！' },
    { key: 'dressing', dialogue: "This new outfit looks great on me!", chinese: '新衣服真好看！' },
    { key: 'sleeping', dialogue: "Good night, zzz...", chinese: '晚安，zzZ...' },
];

// Helper to broadcast student list to teacher
function updateTeacher() {
    if (teacherSocketId) {
        io.to(teacherSocketId).emit('student-list-update', students);
    }
}

io.on('connection', (socket) => {

    console.log('a user connected', socket.id);

    // 1. LISTEN TO ROLE REPORT & INITIALIZE
    socket.on("my-role", function(data){
        if(data.role === "student"){
            
            const randomCatLevel = CAT_TYPES[Math.floor(Math.random() * CAT_TYPES.length)];
            const initialStatus = STATUS_ACTIONS.find(a => a.key === 'sleeping'); 
            
            let studentData = {
                id: socket.id,
                userName: data.userName,
                catName: data.catName,
                catLevel: randomCatLevel, // Randomly assigned
                studentIdx: data.studentIdx, 
                catStatus: 'sleeping', 
                catStatusChinese: initialStatus.chinese,
                studyTime: 'N/A', // New field for Chinese study time
                favoriteSentence: 'N/A', // New field for favorite Chinese sentence
            };

            students.push(studentData);
            console.log(`New Cat Owner: ${data.userName}. Cat Type: ${randomCatLevel}`);
           
            socket.emit('initial-cat-data', { 
                catLevel: randomCatLevel,
                catStatus: initialStatus.key,
                catStatusChinese: initialStatus.chinese,
                studyTime: studentData.studyTime,
                favoriteSentence: studentData.favoriteSentence,
            });
            updateTeacher(); // Notify teacher of new student

        } else if (data.role === "teacher") {
            teacherSocketId = socket.id;
            console.log("Teacher connected.");
            socket.emit('student-list-update', students); // Send initial list
        }
    });
    

    // 2. LISTEN FOR GENERAL CAT STATUS UPDATES FROM STUDENT
    socket.on("update-cat-status", function(data){
        const { newStatus, newStatusChinese } = data;
        
        const student = students.find(s => s.id === socket.id);
        
        if (student) {
            student.catStatus = newStatus;
            student.catStatusChinese = newStatusChinese;
            
            console.log(`Status Update: ${student.userName}'s cat is now: ${newStatus}`);
            updateTeacher(); 
        }
    });

    // 3. LISTEN FOR CHINESE STUDY DATA UPDATE
    socket.on("update-chinese-status", function(data){
        const student = students.find(s => s.id === socket.id);
        
        if (student) {
            student.studyTime = data.studyTime;
            student.favoriteSentence = data.favoriteSentence;
            
            console.log(`Chinese Study Update for ${student.userName}: ${data.studyTime} and "${data.favoriteSentence}"`);
            updateTeacher(); 
        }
    });

  
    // 4. DISCONNECT

    socket.on("disconnect", function(){
        console.log("someone disconnected", socket.id);

        if (socket.id === teacherSocketId) {
            teacherSocketId = null;
            console.log("Teacher disconnected.");
            return;
        }

        let studentIdx = students.findIndex(function(s){
            return s.id === socket.id
        });
        if(studentIdx > -1){
            students.splice(studentIdx, 1);
            updateTeacher(); // Notify teacher of removal
        }
    });

})


// 5. START SERVER (Unchanged)
HTTPSserver.listen(portHTTPS, function(){
    console.log(`listening on *:${portHTTPS}`);
});
