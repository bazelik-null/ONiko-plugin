import {attackNiko, updateVignette, phase} from './health.js'
import {setSprite, updateNikoPosition, direction, nikoPosX, nikoPosY, mousePosX, mousePosY, width, height} from './content.js'
import {createWarnLine, createSquare, createHeal, createGlitchElements, createHoming, checkLineCollision, checkHomingCollision} from "./projectiles.js";

let removalTimeout, lineTimeout, squareTimeout, healTimeout, homingTimeout;
export let isFight = false;

window.setFight = setFight;

function setFight(value: boolean){
    isFight = value;
}
export function moveNikoRandom(){
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const randomX = Math.floor(Math.random() * (screenWidth - 100));
    const randomY = Math.floor(Math.random() * (screenHeight - 100));
    window.setNikoPosX(randomX);
    window.setNikoPosY(randomY);

    updateNikoPosition();
}

export function fightFrame() {
    const diffX = nikoPosX - (mousePosX || nikoPosX);
    const diffY = nikoPosY - (mousePosY || nikoPosY);
    const distance = Math.hypot(diffX, diffY);

    setSprite(direction || "idle", 0, "walk");

    if (distance && (distance < width || distance < height)) {
        // Niko attack
        if (!removalTimeout) {
            attackNiko();
            createGlitchElements();
            moveNikoRandom();

            removalTimeout = setTimeout(() => {
                removalTimeout = null;
            }, 300); // Cooldown
        }
    }

    // Constrain Niko within the window boundaries.
    window.setNikoPosX(Math.min(Math.max(16, nikoPosX), window.innerWidth - 16));
    window.setNikoPosY(Math.min(Math.max(16, nikoPosY), window.innerHeight - 16));

    checkLineCollision()
    checkHomingCollision()

    // Spawn line attacks
    if (!lineTimeout) {
        createWarnLine();
        if (phase < 2) {
            lineTimeout = setTimeout(() => {
                lineTimeout = null;
            }, 1000); // 1 second
        } else {
            lineTimeout = setTimeout(() => {
                lineTimeout = null;
            }, 750); // 1 second
        }
    }

// Spawn squares attacks
    if (!squareTimeout && phase < 2) {
        createSquare();
        if (phase === 0) {
            squareTimeout = setTimeout(() => {
                squareTimeout = null;
            }, 75);
        } else {
            squareTimeout = setTimeout(() => {
                squareTimeout = null;
            }, 50);
        }
    }

// Spawn heals
    if (!healTimeout) {
        createHeal();
        healTimeout = setTimeout(() => {
            healTimeout = null;
        }, 30000); // 60 seconds
    }

// Spawn homing attacks
    if (!homingTimeout && phase > 0) {
        createHoming();
        if (phase === 1) {
            homingTimeout = setTimeout(() => {
                homingTimeout = null;
            }, 7000);
        } else {
            homingTimeout = setTimeout(() => {
                homingTimeout = null;
            }, 500);
        }
    }

    updateNikoPosition();
}


function createLabelWon() {
    let labelElement = document.createElement('div');
    labelElement.style.position = 'fixed';
    labelElement.style.top = '50%';
    labelElement.style.left = '50%';
    labelElement.style.transform = 'translateX(-50%)';
    labelElement.style.fontSize = '100px';
    labelElement.style.fontWeight = 'bold';
    labelElement.style.zIndex = '1001';
    labelElement.style.color = "green";
    document.body.appendChild(labelElement);

    labelElement.textContent = 'YOU WON!';
}

export function win() {
    isFight = false;
    window.setNikoIsSleeping(true)
    window.setNikoIsBlocked(true)

    createLabelWon()
    const options = {
        idleTime: 60000
    }
    browser.storage.local.set(options)
    updateVignette(0);
    window.removeEventListener('wheel')
}