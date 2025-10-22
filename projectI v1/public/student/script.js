// Client Socket Setup
const socket = io();

// Cat Type Configuration (Must match server configuration)
const CAT_TYPES = ['Scat', 'Acat', 'Bcat'];
// FIX: 更新对话文本为用户提供的 Emoji 字符串，并使用 dialogue 字段
const STATUS_ACTIONS = [
    { key: 'studying', dialogue: "✏️📒📓📝🐱", statusText: '在认真学习' },
    { key: 'bathing', dialogue: "🛀🎶🚿🛀🐈", statusText: '正在洗澡' },
    { key: 'eating', dialogue: "🍰🍜🍔🍕🍗🍦🐈", statusText: '正在享受美食' },
    { key: 'sports', dialogue: "⚽️🎣🎾💪🏀🏍️🛹🐈", statusText: '正在运动' },
    { key: 'dressing', dialogue: "👗👚🕶️🎩👒👔👜🐱", statusText: '正在打扮' },
    { key: 'sleeping', dialogue: "💤🌃🛏️😪🧸✨🌛🐱", statusText: '正在睡觉' },
];

// 用于服务器端（Teacher 端）更新的简单中文状态文本
// 由于服务器需要中文状态描述，这里保留一个简短的 statusText 字段
function getCatStatusText(key) {
    const action = STATUS_ACTIONS.find(a => a.key === key);
    return action ? action.statusText : '未知状态';
}


let catInfo = {
    userName: '',
    catName: '',
    catLevel: '',
    catStatus: '', 
    studyTime: 'N/A',
    favoriteSentence: 'N/A',
};

const container = document.getElementById('canvas-container');
const readyBtnLink = document.getElementById('ready');
const audioPlayer = document.getElementById('cat-sound-player'); 


// Function to map action to sound file
function getSoundFile(actionKey) {
    // Study & Bathe -> Acat.mp3
    if (['studying', 'bathing'].includes(actionKey)) return 'sounds/Acat.mp3'; 
    // Eat & Exercise -> Bcat.mp3
    if (['eating', 'sports'].includes(actionKey)) return 'sounds/Bcat.mp3'; 
    // Dress up & Sleep -> Scat.mp3
    if (['dressing', 'sleeping'].includes(actionKey)) return 'sounds/Scat.mp3'; 
    
    return 'sounds/Acat.mp3'; // Default fallback
}

// Function to play sound effect
function playCatSound(actionKey) {
    console.log(actionKey)
    const soundSrc = getSoundFile(actionKey);
    if (audioPlayer.src.indexOf(soundSrc) === -1) {
        audioPlayer.src = soundSrc;
        audioPlayer.load();
    }
    audioPlayer.play().catch(error => {
        console.warn("Audio playback interrupted or failed:", error.message);
    });
}

const CAT_IMAGE_MAP = {
    'Acat': { folder: 'Acats', prefix: 'acat', count: 5 },
    'Bcat': { folder: 'Bcats', prefix: 'bcat', count: 8 },
    'Scat': { folder: 'Scats', prefix: 'scat', count: 13 },
};

// NEW: Function to generate the local image path with randomization
function getCatImageUrl(catLevel) {
    const map = CAT_IMAGE_MAP[catLevel];
    if (!map) {
        console.error(`Invalid cat level: ${catLevel}`);
        return ''; // Fallback for safety
    }

    // 1. Generate a random index between 1 and map.count (inclusive)
    const randomIndex = Math.floor(Math.random() * map.count) + 1;
    
    // 2. Construct the full path using the root-relative path /catimgs/
    // Example: /catimgs/Acats/acat3.png
    const path = `/catimgs/${map.folder}/${map.prefix}${randomIndex}.png`;
    console.log(`Loading image for ${catLevel}: ${path}`);
    return path;
}


// Function to update the dialogue bubble content
// FIX: 统一使用 dialogue 字段更新文本
function updateCatDialogue(message) {
    let dialogElm = document.getElementById('cat-dialogue-text');
    if (dialogElm) {
        dialogElm.textContent = message;
    }
}

// Function to create and show the sign-in form
function showSignInForm() {
    container.innerHTML = `
        <div id="sign-in-form">
            <h2>Welcome, Cat Owner!</h2>
            <p>Please enter your information to start the game.</p>
            <form id="form-submit">
                <label for="userName">Your Name:</label>
                <input type="text" id="userName" required><br><br>
                <label for="catName">Your Cat's Name:</label>
                <input type="text" id="catName" required><br><br>
                <button type="submit" class="action-btn" style="width:100%; margin-top: 15px;">Adopt Your Cat!</button>
            </form>
        </div>
    `;

    document.getElementById('form-submit').addEventListener('submit', function(e) {
        e.preventDefault();
        catInfo.userName = document.getElementById('userName').value;
        catInfo.catName = document.getElementById('catName').value;
        
        if (catInfo.userName && catInfo.catName) {
            const studentIdx = Math.floor(Math.random() * 100); 
            socket.emit("my-role", { 
                role: "student", 
                userName: catInfo.userName, 
                catName: catInfo.catName,
                studentIdx: studentIdx 
            });
            updateCatDialogue("Waiting for your cat to be assigned...");
        } else {
            updateCatDialogue("Please enter both your name and your cat's name.");
        }
    });
}

// Function to initialize the main game UI after receiving cat data
function initializeGameUI() {
    const initialAction = STATUS_ACTIONS.find(a => a.key === catInfo.catStatus);
    const initialDialogue = initialAction ? initialAction.dialogue : STATUS_ACTIONS[STATUS_ACTIONS.length - 1].dialogue;
    
    // Main Game Interface
    container.innerHTML = `
        <div id="cat-name-display">
            <div class="cat-title">${catInfo.catName}</div>
            
            <div id="cat-type-and-progress">
                <div class="cat-owner">Owned by: ${catInfo.userName}</div>
                <span class="cat-type-badge">${catInfo.catLevel}</span>
                
                <div id="chinese-progress">
                    <p>Chinese Study Time: <strong>${catInfo.studyTime}</strong></p>
                    <p>Favorite Sentence: <strong>${catInfo.favoriteSentence}</strong></p>
                </div>
            </div>
        </div>

        <img id="catImg" src="${getCatImageUrl(catInfo.catLevel)}" alt="${catInfo.catLevel} Cat">

        <div class="cat-dialog">
            <p id="cat-dialogue-text">${initialDialogue}</p>
        </div>

        <div class="action-buttons-grid">
            ${STATUS_ACTIONS.map(action => `
                <button class="action-btn" data-status="${action.key}">
                    ${action.key.charAt(0).toUpperCase() + action.key.slice(1)}
                </button>
            `).join('')}
        </div>
    `;
    
    // Add event listeners to the action buttons
    document.querySelectorAll('.action-btn').forEach(button => {
        button.addEventListener('click', handleCatAction);
    });
}

// Function to update the Chinese progress UI
function updateChineseProgress() {
    const progressElm = document.getElementById('chinese-progress');
    if (progressElm) {
        progressElm.innerHTML = `
            <p>Chinese Study Time: <strong>${catInfo.studyTime}</strong></p>
            <p>Favorite Sentence: <strong>${catInfo.favoriteSentence}</strong></p>
        `;
    }
}

// Function to show the modal for Study input
function showStudyModal() {
    const modal = document.createElement('div');
    modal.id = 'study-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Record Your Chinese Study!</h3>
            <form id="study-form">
                <label for="studyTime">Study Duration (e.g., 30 mins):</label>
                <input type="text" id="studyTime" placeholder="e.g. 30 mins" required style="width: calc(100% - 24px);"><br>
                
                <label for="favSentence">Favorite Chinese Sentence:</label>
                <input type="text" id="favSentence" placeholder="e.g. 我爱猫咪" required style="width: calc(100% - 24px);"><br>
                
                <button type="submit" class="action-btn" style="width: 100%;">Submit and Study</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('study-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newStudyTime = document.getElementById('studyTime').value;
        const newFavSentence = document.getElementById('favSentence').value;
        
        // Update client state
        catInfo.studyTime = newStudyTime;
        catInfo.favoriteSentence = newFavSentence;
        
        // Send updated Chinese data to server
        socket.emit("update-chinese-status", {
            studyTime: newStudyTime,
            favoriteSentence: newFavSentence
        });

        // Continue with normal 'studying' action update
        performCatAction('studying'); 
        
        // Update UI
        updateChineseProgress();
        
        // Close modal
        document.body.removeChild(modal);
    });
}

// Function that handles common cat action logic
function performCatAction(newStatus) {
    const action = STATUS_ACTIONS.find(a => a.key === newStatus);
    const oldStatus = catInfo.catStatus;

    if (action) {
        // If status is the same, just update dialogue for feedback
        if (newStatus === oldStatus) {
            updateCatDialogue(action.dialogue); 
            playCatSound(newStatus); // Still play sound for feedback
            return;
        }

        // 1. Update client state and UI
        catInfo.catStatus = newStatus;
        // FIX: 使用新的 dialogue 字段更新文本
        updateCatDialogue(action.dialogue);
        
        // 2. Play sound
        playCatSound(newStatus); 
        
        // 3. Add visual bounce effect
        const imgElm = document.getElementById('catImg');
        if(imgElm) {
            imgElm.style.transform = 'scale(1.05)';
            setTimeout(() => {
                imgElm.style.transform = 'scale(1.0)';
            }, 150);
        }

        // 4. Notify server of status change
        // FIX: 服务器端需要一个简单的中文描述
        socket.emit("update-cat-status", {
            newStatus: newStatus,
            newStatusChinese: getCatStatusText(newStatus) // 使用简短的状态描述
        });
    }
}

// Function to handle cat action button clicks
function handleCatAction(event) {
    const newStatus = event.currentTarget.getAttribute('data-status');
    
    if (newStatus === 'studying') {
        showStudyModal();
    } else {
        performCatAction(newStatus);
    }
}


// --- MAIN EXECUTION ---

window.addEventListener("load", function() {
    
    // Hide the ready button and show the sign-in form on load
    readyBtnLink.style.display = 'none';
    showSignInForm();

    // --- SOCKET LISTENERS ---
    
    // Listener for initial cat data from server
    socket.on('initial-cat-data', function(data) {
        console.log("Received initial cat data:", data);
        catInfo.catLevel = data.catLevel;
        catInfo.catStatus = data.catStatus;
        catInfo.studyTime = data.studyTime || 'N/A';
        catInfo.favoriteSentence = data.favoriteSentence || 'N/A';
        initializeGameUI();
    });

    socket.on('connect', () => {
        console.log('Connected to server, socket ID:', socket.id);
    });

    socket.on('disconnect', () => {
        console.error('Disconnected from server.');
        updateCatDialogue("Connection lost. Please refresh the page.");
    });

});
