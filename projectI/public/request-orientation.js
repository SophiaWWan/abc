let deviceTiltX = 0; 
let deviceTiltY = 0; 

function handleOrientation(event) {
    window.deviceTiltY = event.gamma || 0; 
    window.deviceTiltX = event.beta || 0;
}

function startOrientationListener() {
    window.addEventListener('deviceorientation', handleOrientation);
    console.log("Device orientation listener started.");
}


function setupOrientationRequestButton() {
    const canvasContainer = document.getElementById('canvas-container');
    const startButton = document.createElement('button');
    
    startButton.innerText = 'Start';
    
    startButton.style.cssText = `
        position: absolute;
        top: 30%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 10px 30px;
        z-index: 1000;
        font-size: 24px;
        color: ${window.Y2K_PINK || '#FF00FF'}; /* 尝试使用 Y2K_PINK 颜色 */
        background-color: ${window.BACKGROUND_COLOR || 'rgb(20, 20, 20)'}; 
        border: 3px solid ${window.Y2K_BLUE || '#00FFFF'};
        cursor: pointer;
        transition: transform 0.1s ease;
    `;
    
    startButton.addEventListener('mousedown', () => { startButton.style.transform = 'translate(-50%, -50%) scale(0.98)'; });
    startButton.addEventListener('mouseup', () => { startButton.style.transform = 'translate(-50%, -50%) scale(1)'; });

    canvasContainer.appendChild(startButton);

    startButton.addEventListener('click', () => {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        startButton.remove();
                        startOrientationListener();
                        window.isMotionAllowed = true; 
                    } else {
                        alert('Permission denied. Cannot activate motion control.');
                    }
                })
                .catch(error => {
                    console.error('Permission request failed:', error);
                });
        } else {
            startButton.remove();
            startOrientationListener();
            window.isMotionAllowed = true;
        }
    });
}

window.deviceTiltX = deviceTiltX;
window.deviceTiltY = deviceTiltY;
window.isMotionAllowed = false; 