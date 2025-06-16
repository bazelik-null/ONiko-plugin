//@flow

/* -------------------------------- */
/* ---------- ONIKO MAIN ---------- */
/* -------------------------------- */

import { updateVignette, createHpBarPlayer, createHpBarNiko } from './health.js';
import { fightFrame, moveNikoRandom, isFight } from "./fight.js";

const nikoElement = document.createElement("div");

export let direction, nikoPosX, nikoPosY, isSleeping, mousePosX, mousePosY;
export let isBlocked = false;
export let width, height;

let nikoSpeed, sleepFrameSpeed, idleTime, character;
let frameCount = 0;
let sleepFrameCount = 0;
let sleepTimer;
let spriteWalk, spriteSleep, spriteSet;
let nikoWalk, nikoSleep;

window.setNikoPosX = setNikoPosX
window.setNikoPosY = setNikoPosY
window.setNikoIsSleeping = setNikoIsSleeping
window.setNikoIsBlocked = setNikoIsBlocked

// Clean up Niko before the window unloads.
window.addEventListener("beforeunload", function () {
    const existingNiko = document.getElementById("oniko");
    if (existingNiko) {
        existingNiko.remove();
    }
});

init();

browser.storage.local.get(["nikoPosX", "nikoPosY", "mousePosX", "mousePosY", "isSleeping", "sleepFrameSpeed", "nikoSpeed", "idleTime", "sprite"]).then((result) => {
    nikoPosX = result.nikoPosX || 32;
    nikoPosY = result.nikoPosY || 32;
    mousePosX = result.mousePosX || 0;
    mousePosY = result.mousePosY || 0;
    isSleeping = result.isSleeping || false;
    sleepFrameSpeed = result.sleepFrameSpeed || 0.1;
    nikoSpeed = result.nikoSpeed || 10;
    idleTime = result.idleTime || 60000;
    character = result.sprite || "Niko";

    //Enable easter egg
    if (idleTime === 143000) {
        nikoSpeed = 10
        character = "TWM"
        window.setFight(true)
        updateVignette(0);
        createHpBarPlayer();
        createHpBarNiko();
        window.addEventListener('wheel', (event) => {
            event.preventDefault();
        }, { passive: false });
    }

    fetch(browser.runtime.getURL("img/" + character + "/meta.json"))
        .then(response => {
            return response.json();
        })
        .then(data => {
            spriteWalk = data.spriteWalk;
            spriteSleep = data.spriteSleep;
            nikoWalk = browser.runtime.getURL("img/" + data.nikoWalk);
            nikoSleep = browser.runtime.getURL("img/" + data.nikoSleep);
        });
});

/* ------------------------------------- */
/* ---------- SPRITE HANDLING ---------- */
/* ------------------------------------- */

// Update the sprite based on the given frame count.
export function setSprite(name: String, frame, state) {
    if (state === "walk") {
        spriteSet = spriteWalk;
        width = spriteWalk.width || 48;
        height = spriteWalk.height || 64;
        nikoElement.style.backgroundImage = `url(${nikoWalk})`;
    }

    if (state === "sleep") {
        spriteSet = spriteSleep;
        width = spriteSleep.width;
        height = spriteSleep.height;
        nikoElement.style.backgroundImage = `url(${nikoSleep})`;
    }

    if (name !== undefined) {
        nikoElement.style.width = width + 'px';
        nikoElement.style.height = height + 'px';
        const sprite = spriteSet[name][frame % spriteSet[name].length];
        nikoElement.style.backgroundPosition = `${sprite[0] * width}px ${sprite[1] * height}px`;
    }
}

/* -------------------------------- */
/* ---------- INIT ONIKO ---------- */

/* -------------------------------- */

function init() {
    const existingNiko = document.getElementById("oniko");
    if (existingNiko) {
        existingNiko.remove();
    }

    nikoElement.id = "oniko";
    nikoElement.ariaHidden = true;
    nikoElement.style.position = "fixed";
    nikoElement.style.pointerEvents = "none";
    nikoElement.style.imageRendering = "pixelated";
    nikoElement.style.zIndex = 2147483647;

    nikoElement.style.setProperty("margin", "0px", "important");
    nikoElement.style.setProperty("padding", "0px", "important");
    nikoElement.style.setProperty("background-color", "transparent", "important");
    nikoElement.style.setProperty("box-shadow", "0px 0px 0px 0px transparent", "important");

    document.body.appendChild(nikoElement);

    browser.storage.local.get(['nikoPosX', 'nikoPosY', 'mousePosX', 'mousePosY', 'isSleeping']).then((result) => {
        nikoPosX = result.nikoPosX || 32;
        nikoPosY = result.nikoPosY || 32;
        mousePosX = result.mousePosX || undefined;
        mousePosY = result.mousePosY || undefined;
        isSleeping = result.isSleeping || undefined;
    });

    resetSleepTimer(isBlocked);

    window.requestAnimationFrame(onAnimationFrame);

    if (isFight) {
        moveNikoRandom()
    }

    document.addEventListener('mousemove', (event) => {
        mousePosX = event.clientX;
        mousePosY = event.clientY;
        resetSleepTimer(isBlocked);
        if (!document.hidden) {
            window.requestAnimationFrame(onAnimationFrame);
        }
    });
}

/* ------------------------------- */
/* ---------- ANIMATION ---------- */

/* ------------------------------- */

function setNikoPosX(value: number) {
    nikoPosX = value
}

function setNikoPosY(value: number) {
    nikoPosY = value
}

function setNikoIsSleeping(value: boolean) {
    isSleeping = value
}

function setNikoIsBlocked(value: boolean) {
    isBlocked = value
}

function frame() {
    const diffX = nikoPosX - (mousePosX || nikoPosX);
    const diffY = nikoPosY - (mousePosY || nikoPosY);
    const distance = Math.hypot(diffX, diffY);

    // Start sleep timer if Niko is near the mouse and not already sleeping.
    if (distance < 128 && !sleepTimer && !isSleeping) {
        sleepTimer = setTimeout(() => {
            isSleeping = true;
            sleepFrameCount = 0;
        }, idleTime);
    }

    const normalizedX = diffX / distance;
    const normalizedY = diffY / distance;

    if (normalizedY > 0.5) {
        direction = "N";
    } else if (normalizedY < -0.5) {
        direction = "S";
    } else if (normalizedX > 0.5) {
        direction = "W";
    } else if (normalizedX < -0.5) {
        direction = "E";
    }

    setSprite(direction, frameCount, "walk");

    if (isSleeping) {
        setSprite(direction, Math.floor(sleepFrameCount), "sleep");
        sleepFrameCount += sleepFrameSpeed;
        return;
    }

    // Stop animation if Niko is close to the mouse.
    if (distance < width || distance < height) { // Используем размеры спрайта
        setSprite(direction || "idle", 0, "walk");
        return;
    }
    setSprite(direction, frameCount, "walk");

    nikoPosX -= (diffX / distance) * nikoSpeed;
    nikoPosY -= (diffY / distance) * nikoSpeed;

    updateNikoPosition();
}

let lastFrameTimestamp;

// Primary animation loop.
function onAnimationFrame(timestamp) {
    if (!nikoElement.isConnected) return;
    if (document.hidden) return;
    frameCount += 1

    if (!lastFrameTimestamp) lastFrameTimestamp = timestamp;
    if (timestamp - lastFrameTimestamp > 70) {
        lastFrameTimestamp = timestamp;
        if (isFight) {
            fightFrame()
        } else {
            frame();
        }
    }
    window.requestAnimationFrame(onAnimationFrame);
}

function resetSleepTimer(isBlocked) {
    if (isBlocked) {
        return;
    }

    clearTimeout(sleepTimer);
    sleepTimer = null;
    if (isSleeping) {
        isSleeping = false;
        sleepFrameCount = 0;
    }
}

/* -------------------------- */
/* ---------- SYNC ---------- */

/* -------------------------- */

export function updateNikoPosition() {
    nikoElement.style.left = `${nikoPosX - 24}px`;
    nikoElement.style.top = `${nikoPosY - 32}px`;
    browser.runtime.sendMessage({
        action: "updateNikoPosition", nikoPosX, nikoPosY, mousePosX, mousePosY, isSleeping
    });
}

browser.runtime.onMessage.addListener(function (request) {
    nikoPosX = request.nikoPosX;
    nikoPosY = request.nikoPosY;
    mousePosX = request.mousePosX;
    mousePosY = request.mousePosY;
    isSleeping = request.isSleeping;
});

// Handle tab visibility changes.
window.addEventListener("visibilitychange", function () {
    if (!document.hidden) {
        // When the tab becomes active, load the last known position from storage.
        browser.storage.local.get(['nikoPosX', 'nikoPosY', 'mousePosX', 'mousePosY', 'isSleeping']).then((result) => {
            nikoPosX = result.nikoPosX || nikoPosX;
            nikoPosY = result.nikoPosY || nikoPosY;
            mousePosX = result.mousePosX || mousePosX;
            mousePosY = result.mousePosY || mousePosY;
            isSleeping = result.isSleeping || isSleeping;
            // Restart the animation loop.
            resetSleepTimer(isBlocked);
            window.requestAnimationFrame(onAnimationFrame);
        });
    }
});

