const canvasContainer = document.getElementById('canvas-container'); 
let canvas;
let ctx;

const Y2K_PINK = '#FF00FF';
const Y2K_BLUE = '#00FFFF';
const BACKGROUND_COLOR = 'rgb(20, 20, 20)';
const EAR_INNER_COLOR = '#2d1bf3ff'; 

const COLLISION_DIALOG_COLOR = 'rgba(255, 255, 0, 0.9)'; 
const COLLISION_TEXT_COLOR = '#FF00FF';                   

let vSize; 
let initialVSize; 
let faceCenterX;
let faceCenterY; 
let heightFactor = 1.2; 

let animationTime = 0; 
let lastTime = 0;

const TILT_SENSITIVITY_X = 5.5; 
const TILT_SENSITIVITY_Y = 5.5; 
const ACTIVATION_THRESHOLD = 5; 

const DIALOG_COLOR = 'rgba(255, 255, 255, 0.9)'; 
const DIALOG_TEXT_COLOR = Y2K_PINK; 

const DIALOG_RESET_TIME = 2000;      
const DIALOG_CHINESE_DURATION = 5000;  

let dialogState = 'IDLE'; 
let animationStartTime = 0;
let animationDuration = 500; 

let dialogX = 0;
let dialogY = 0;
let dialogVelocityX = 0; 
const BOUNCE_DAMPING = 0.8; 
const FRICTION = 0.95;      

let initialDialogX;
let initialDialogY;

const CYCLE_WORDS = [
    { en: 'Hello', ch: '你好' },
    { en: "I'm Kitty", ch: '我是Kitty' },
    { en: "I'm from Nepal", ch: '我来自尼泊尔' },
    { en: "I'm 10 years old", ch: '我十岁了' },
    { en: 'Who are you', ch: '你是谁' },
];
let currentCycleIndex = 0;
let isDialogVisible = true; 
let dialogText = CYCLE_WORDS[0].en; 


function HSBtoHSL(h, s, b) {
    let lightness = (2 - s / 100) * (b / 100) / 2;
    let saturation = s / 100 * b / 100 / (1 - Math.abs(2 * lightness - 1));
    saturation = isNaN(saturation) ? 0 : saturation;
    return `hsl(${h}, ${saturation * 100}%, ${lightness * 100}%)`;
}
function drawTriangle(x1, y1, x2, y2, x3, y3, color) {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.closePath(); ctx.fill();
}
function drawEllipse(cx, cy, radiusX, radiusY, color) {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.ellipse(cx, cy, radiusX, radiusY, 0, 0, 2 * Math.PI); ctx.fill();
}
function drawRoundedRect(x, y, width, height, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + radius, y); ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius); ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius); ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius); ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius); ctx.closePath(); ctx.fill();
}
function checkCatCollision(dialogX, dialogY, dialogW, dialogH, faceY) {
    const faceRect = { x: faceCenterX - vSize * 0.9, y: faceY - vSize * 1.0, w: vSize * 1.8, h: vSize * 2.5 };
    const dialogRect = { x: dialogX, y: dialogY, w: dialogW, h: dialogH };
    return (
        dialogRect.x < faceRect.x + faceRect.w && dialogRect.x + dialogRect.w > faceRect.x &&
        dialogRect.y < faceRect.y + faceRect.h && dialogRect.y + dialogRect.h > faceRect.y
    );
}


function initializeCanvas() {
    if (!canvasContainer) { console.error("Canvas container element 'canvas-container' not found!"); return; }

    const startButton = document.getElementById('start-button');
    if (localStorage.getItem('animationState') !== 'active' && startButton) {
        startButton.style.display = 'block';
        return; 
    } else if (startButton) {
        startButton.style.display = 'none';
    }

    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');
    canvasContainer.appendChild(canvas);
    
    onWindowResize();
    
    dialogX = initialDialogX;
    dialogY = initialDialogY; 
    
    if (typeof setupOrientationRequestButton === 'function') {
        setupOrientationRequestButton();
    } 
  
    currentCycleIndex = 0;
    dialogText = CYCLE_WORDS[0].en;
    dialogState = 'IDLE';

    requestAnimationFrame(animationLoop);
}

window.startAnimation = function() {
    localStorage.setItem('animationState', 'active');
    document.getElementById('start-button').style.display = 'none';
    initializeCanvas();
}


function animationLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    animationTime += deltaTime; 
    const scaleFactor = (Math.sin(animationTime * 0.002) + 1) / 2 * (1.1 - 0.9) + 0.9;
    vSize = initialVSize * scaleFactor;
    const eyeColor = HSBtoHSL((scaleFactor - 0.9) / 0.2 * (360 - 250) + 250, 80, 100);
    const floatOffset = Math.sin(animationTime * 0.001) * canvas.height * 0.02;
    const currentFaceCenterY = faceCenterY + floatOffset; 
    const earAngleOffset = Math.sin(animationTime * 0.0015) * 10 * (Math.PI / 180);

    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    const earBaseX = vSize * 1.2;
    const earBaseY = currentFaceCenterY - vSize * 1.2;
    const earWidthX = vSize * 0.4;
    const earSideX = vSize * 0.6;
    const leftEarTipX = faceCenterX - earBaseX - earWidthX / 2 + earSideX / 2;
    const leftEarTipY = earBaseY - vSize * 1.0 / 2 - vSize * 0.3 / 2;
    const rightEarTipX = faceCenterX + earBaseX + earWidthX / 2 - earSideX / 2;
    const rightEarTipY = earBaseY - vSize * 1.0 / 2 - vSize * 0.3 / 2;
    const mouthBottomY = currentFaceCenterY + vSize * 0.3; 
    const eyeXOffset = vSize * 0.7; const eyeYOffset = vSize * 0.7; const eyeWidth = vSize * 0.4; const eyeHeight = vSize * 0.55; const pupilWidth = eyeWidth * 0.6; const pupilHeight = eyeHeight * 0.6;
    ctx.save(); ctx.translate(faceCenterX - earBaseX, earBaseY); ctx.rotate(-earAngleOffset); drawTriangle(0, 0, -vSize * 0.4, -vSize * 1.0, vSize * 0.6, -vSize * 0.3, Y2K_PINK); drawTriangle(0, 0, -vSize * 0.4 * 0.4, -vSize * 0.7, vSize * 0.6, -vSize * 0.3, EAR_INNER_COLOR); ctx.restore();
    ctx.save(); ctx.translate(faceCenterX + earBaseX, earBaseY); ctx.rotate(earAngleOffset); drawTriangle(0, 0, vSize * 0.4, -vSize * 1.0, -vSize * 0.6, -vSize * 0.3, Y2K_PINK); drawTriangle(0, 0, vSize * 0.4 * 0.4, -vSize * 0.7, -vSize * 0.6, -vSize * 0.3, EAR_INNER_COLOR); ctx.restore();
    drawEllipse(faceCenterX - eyeXOffset, currentFaceCenterY - eyeYOffset, eyeWidth, eyeHeight, Y2K_BLUE); drawEllipse(faceCenterX + eyeXOffset, currentFaceCenterY - eyeYOffset, eyeWidth, eyeHeight, Y2K_BLUE); drawEllipse(faceCenterX - eyeXOffset, currentFaceCenterY - eyeYOffset * 1.2, pupilWidth, pupilHeight, eyeColor); drawEllipse(faceCenterX + eyeXOffset, currentFaceCenterY - eyeYOffset * 1.2, pupilWidth, pupilHeight, eyeColor);
    const noseBaseY = currentFaceCenterY + vSize * 0.2; const noseTipY = currentFaceCenterY - vSize * 0.03; 
    drawTriangle(faceCenterX, noseBaseY, faceCenterX - vSize * 0.15, noseTipY, faceCenterX + vSize * 0.15, noseTipY, Y2K_BLUE);
    const centerLineY = noseBaseY + vSize * 0.15; const arcControlY = centerLineY + vSize * 0.05; 
    ctx.strokeStyle = Y2K_PINK; ctx.lineWidth = vSize * 0.05;
    ctx.beginPath(); ctx.moveTo(faceCenterX, noseBaseY); ctx.lineTo(faceCenterX, centerLineY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(faceCenterX, centerLineY); ctx.quadraticCurveTo(faceCenterX - vSize * 0.15, arcControlY, faceCenterX - vSize * 0.3, currentFaceCenterY + vSize * 0.3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(faceCenterX, centerLineY); ctx.quadraticCurveTo(faceCenterX + vSize * 0.15, arcControlY, faceCenterX + vSize * 0.3, currentFaceCenterY + vSize * 0.3); ctx.stroke();
    ctx.strokeStyle = Y2K_BLUE; ctx.lineWidth = vSize * 0.03;
    const whiskerLength = vSize * 0.8; const whiskerAngleStep = Math.PI / 8; 
    const startXLeft = faceCenterX - vSize * 0.25; const startXRight = faceCenterX + vSize * 0.25; const startY = currentFaceCenterY + vSize * 0.2;
    for (let i = 0; i < 3; i++) {
        let angle = (i - 1) * whiskerAngleStep; 
        let x2L = startXLeft + Math.cos(angle + Math.PI) * whiskerLength; let y2L = startY + Math.sin(angle + Math.PI) * whiskerLength * 0.5;
        ctx.beginPath(); ctx.moveTo(startXLeft, startY); ctx.lineTo(x2L, y2L); ctx.stroke();
        let x2R = startXRight + Math.cos(angle) * whiskerLength; let y2R = startY + Math.sin(angle) * whiskerLength * 0.5;
        ctx.beginPath(); ctx.moveTo(startXRight, startY); ctx.lineTo(x2R, y2R); ctx.stroke();
    }
    
    if (window.isMotionAllowed) {
        
        const dialogWidth = 240;
        const dialogHeight = 80;
        const dialogRadius = 15;

        if (dialogState === 'ACTIVE_CHINESE' && timestamp - animationStartTime > DIALOG_CHINESE_DURATION) {
            
            currentCycleIndex++; 
            
            if (currentCycleIndex >= CYCLE_WORDS.length) {
                dialogText = CYCLE_WORDS[CYCLE_WORDS.length - 1].ch; 
            } else {
                dialogText = CYCLE_WORDS[currentCycleIndex].en;
                dialogState = 'IDLE';
                dialogX = initialDialogX;
                dialogY = initialDialogY;
                dialogVelocityX = 0;
            }
        }
        
        const tiltX = (window.deviceTiltY || 0); 
        const tiltY = (window.deviceTiltX || 0); 

        if (isDialogVisible) {
            
            const isActivated = Math.abs(tiltX) > ACTIVATION_THRESHOLD || Math.abs(tiltY) > ACTIVATION_THRESHOLD;
            const tiltXForce = tiltX * TILT_SENSITIVITY_X;
            const tiltYForce = tiltY * TILT_SENSITIVITY_Y;
            
            if (dialogState === 'IDLE' || dialogState === 'ACTIVE_CHINESE') {
                
                if (isActivated) {
                    
                    dialogVelocityX += (tiltXForce * deltaTime / 1000); 
                    dialogVelocityX *= FRICTION; 
                    dialogX += dialogVelocityX;
                    
                    dialogY = initialDialogY + tiltYForce;

                    if (dialogX <= 0 || dialogX + dialogWidth >= canvas.width) {
                        dialogVelocityX = -dialogVelocityX * BOUNCE_DAMPING; 
                        if (dialogX <= 0) dialogX = 0;
                        if (dialogX + dialogWidth >= canvas.width) dialogX = canvas.width - dialogWidth;
                    }

                } else {
                    dialogX = initialDialogX;
                    dialogY = initialDialogY;
                    dialogVelocityX *= FRICTION;
                }
                
                if (dialogY <= 0) {
                    isDialogVisible = false;
                    dialogHiddenTime = timestamp; 
                    dialogState = 'IDLE'; 
                    
                    if (currentCycleIndex === CYCLE_WORDS.length - 1 && dialogText === CYCLE_WORDS[CYCLE_WORDS.length - 1].ch) {
                         localStorage.setItem('animationState', 'reset');
                         window.location.reload(); 
                         return; 
                    }
                    
                } 
                
                else if (dialogState === 'IDLE' && checkCatCollision(dialogX, dialogY, dialogWidth, dialogHeight, currentFaceCenterY)) {
                    dialogState = 'TO_EAR'; 
                    animationStartTime = timestamp;
                    startDialogX = dialogX;
                    startDialogY = dialogY;

                    if (Math.random() < 0.5) { targetEarX = leftEarTipX; targetEarY = leftEarTipY; } 
                    else { targetEarX = rightEarTipX; targetEarY = rightEarTipY; }
                }

            }
            
            else if (dialogState === 'TO_EAR') {
                const elapsed = timestamp - animationStartTime;
                const progress = Math.min(elapsed / animationDuration, 1);
                
                dialogX = startDialogX + (targetEarX - startDialogX) * progress;
                dialogY = startDialogY + (targetEarY - startDialogY) * progress;
                
                let currentDialogWidth = dialogWidth * (1 - progress);
                let currentDialogHeight = dialogHeight * (1 - progress);
                
                if (progress >= 1) {
                    dialogState = 'FROM_MOUTH'; 
                    animationStartTime = timestamp;
                    dialogText = CYCLE_WORDS[currentCycleIndex].ch; 
                    
                    dialogX = faceCenterX - dialogWidth / 2;
                    dialogY = mouthBottomY; 
                    startDialogX = dialogX;
                    startDialogY = dialogY;
                } else {
                    drawRoundedRect(dialogX, dialogY, currentDialogWidth, currentDialogHeight, dialogRadius * (1 - progress), DIALOG_COLOR);
                    ctx.fillStyle = DIALOG_TEXT_COLOR;
                    ctx.font = `bold ${32 * (1 - progress)}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(CYCLE_WORDS[currentCycleIndex].en, dialogX + currentDialogWidth / 2, dialogY + currentDialogHeight / 2);
                }

            } 
            
            else if (dialogState === 'FROM_MOUTH') {
                const elapsed = timestamp - animationStartTime;
                const progress = Math.min(elapsed / animationDuration, 1);
                const targetX = initialDialogX; 
                const targetY = initialDialogY; 

                dialogX = startDialogX + (targetX - startDialogX) * progress;
                dialogY = startDialogY + (targetY - startDialogY) * progress;
                
                let currentDialogWidth = dialogWidth * progress;
                let currentDialogHeight = dialogHeight * progress;

                const currentDialogColor = COLLISION_DIALOG_COLOR;
                const currentTextColor = COLLISION_TEXT_COLOR;
                drawRoundedRect(dialogX, dialogY, currentDialogWidth, currentDialogHeight, dialogRadius * progress, currentDialogColor);
                ctx.fillStyle = currentTextColor;
                ctx.font = `bold ${36 * progress}px Arial`; 
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(dialogText, dialogX + dialogWidth / 2, dialogY + dialogHeight / 2);

                if (progress >= 1) {
                    dialogState = 'ACTIVE_CHINESE'; 
                    animationStartTime = timestamp; 
                }
            }
            
            if (dialogState === 'IDLE') {
                drawRoundedRect(dialogX, dialogY, dialogWidth, dialogHeight, dialogRadius, DIALOG_COLOR);
                ctx.fillStyle = DIALOG_TEXT_COLOR;
                ctx.font = 'bold 32px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(dialogText, dialogX + dialogWidth / 2, dialogY + dialogHeight / 2);
            } else if (dialogState === 'ACTIVE_CHINESE') {
                const currentDialogColor = COLLISION_DIALOG_COLOR;
                const currentTextColor = COLLISION_TEXT_COLOR;
                drawRoundedRect(dialogX, dialogY, dialogWidth, dialogHeight, dialogRadius, currentDialogColor);
                ctx.fillStyle = currentTextColor;
                ctx.font = 'bold 36px Arial'; 
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(dialogText, dialogX + dialogWidth / 2, dialogY + dialogHeight / 2);
            }
        }
    }

    requestAnimationFrame(animationLoop);
}

function onWindowResize() {
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        faceCenterX = canvas.width / 2; 
        
        initialVSize = Math.min(canvas.width * 0.25, canvas.height * 0.25);
        faceCenterY = canvas.height - initialVSize * 1.2;
        
        const dialogWidth = 200;
        initialDialogX = canvas.width - dialogWidth - 30;
        initialDialogY = 30 + (canvas.height * 0.1); 
        
        if (dialogState === 'IDLE' || dialogState === 'ACTIVE_CHINESE' || !isDialogVisible) {
             dialogX = initialDialogX;
             dialogY = initialDialogY; 
        }
    }
}


window.addEventListener('resize', onWindowResize);
window.addEventListener('load', initializeCanvas);