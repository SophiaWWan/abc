const socket = io();

// DOM Elements
const gridContainer = document.getElementById('cat-grid-container');

// FIX 3: Map status keys to human-readable names with emojis
const STATUS_NAMES = {
    studying: '📚 Studying',
    bathing: '🛁 Bathing',
    eating: '🍽️ Eating',
    sports: '🏃 Exercising',
    dressing: '👔 Dressing Up',
    sleeping: '😴 Sleeping'
};

function initializeTeacher() {
    socket.emit("my-role", { role: "teacher" });
}

// Function to render all student cards
function renderStudentCards(students) {
    if (students.length === 0) {
        gridContainer.innerHTML = `<div id="status-message">No student cats are online yet.</div>`;
        return;
    }

    gridContainer.innerHTML = ''; // Clear previous cards

    students.forEach(student => {
        const card = document.createElement('div');
        card.className = 'cat-card';

        const statusKey = student.catStatus || 'sleeping';
        const statusName = STATUS_NAMES[statusKey] || 'N/A';
        const statusClass = `status-${statusKey}`;

        card.innerHTML = `
            <div class="card-title">${student.catName}</div>
            <div class="owner-info">Owner: ${student.userName}</div>
            
            <div class="status-badge ${statusClass}">
                <!-- FIX 4: 更改 "Current Status" 为 "Cat Status" -->
                Cat Status: ${statusName}
            </div>

            <div class="type-and-progress">
                <div class="cat-type">Type: <span>${student.catLevel}</span></div>
                
                <div class="chinese-data">
                    <p>Study Time: <strong>${student.studyTime || 'N/A'}</strong></p>
                    <p>Favorite Sentence: <strong>${student.favoriteSentence || 'N/A'}</strong></p>
                </div>
            </div>
        `;
        gridContainer.appendChild(card);
    });
}


// --- SOCKET LISTENERS ---
socket.on('connect', () => {
    console.log('Connected to server as Teacher, socket ID:', socket.id);
    initializeTeacher();
});

socket.on('disconnect', () => {
    console.error('Disconnected from server.');
    gridContainer.innerHTML = '<div id="status-message" style="color: red;">Connection lost. Please refresh the page.</div>';
});

// Listener for real-time student list updates
socket.on('student-list-update', (students) => {
    console.log("Received updated student list:", students);
    renderStudentCards(students);
});

// Initialization on window load (redundant but safe)
window.addEventListener("load", initializeTeacher);
