//initialize socket connection
const socket = io();
let username = "";
const nameInput = document.querySelector("#nameWrapper input");
const confirmBtn = document.querySelector("#confirmBtn");

let formeElm = document.querySelector("#chatForm");
let msgInput = document.querySelector("#newMessage");

// LISTEN FOR NEWLY TYPED MESSAGES, 
// SEND THEM TO THE SERVER
formeElm.addEventListener("submit", newMessagesSubmitted);

nameInput.addEventListener("change", () => {
    username = nameInput.value.trim();
    console.log("Username set to:", username);
});

confirmBtn.addEventListener("click", () => {
    username = nameInput.value.trim();
    if(username){
        console.log("Username confirmed:", username);
    } else {
        alert("Please enter a name first!");
    }
});

function newMessagesSubmitted(event){
    event.preventDefault();

    let newMsg = msgInput.value.trim();
    if (!newMsg) return;

    socket.emit("message", {
        sender: username,
        message: newMsg
    });

    // clear out input:
    msgInput.value = "";
}

// LISTEN FOR NEW MESSAGES FROM SERVER
socket.on("newMessage", function(data){
    appendMessageWithUsername(data.sender, data.message);
})

// APPEND MESSAGES TO BOX 
function appendMessageWithUsername(sender, message){
    let chatThreadList = document.querySelector("#threadWrapper ul");

    let newListItem = document.createElement("li");

    let whoSpan = document.createElement("span");
    whoSpan.classList.add("who");
    whoSpan.textContent = sender + ":";

    let wordsSpan = document.createElement("span");
    wordsSpan.classList.add("words");
    wordsSpan.textContent = message;

    newListItem.appendChild(whoSpan);
    newListItem.appendChild(wordsSpan);

    chatThreadList.appendChild(newListItem);
    chatThreadList.scrollTop = chatThreadList.scrollHeight;
}
