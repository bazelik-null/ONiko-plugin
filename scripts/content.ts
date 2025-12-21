/* -------------------------------- */
/* ---------- ONIKO MAIN ---------- */
/* -------------------------------- */

import {initBattleUI, player, vignette} from './battleUI';
import {fightFrame, moveNikoRandom} from "./fight";
import {initHazards} from "./projectiles";
import {Mouse} from "./mouse";
import {Oniko} from "./oniko";

const nikoElement = document.createElement("div");

window.setNikoPosX = setNikoPosX
window.setNikoPosY = setNikoPosY
window.setNikoIsSleeping = setNikoIsSleeping
window.setNikoIsBlocked = setNikoIsBlocked
let isFight = window.isFight;

let sprite: string;

let spriteWalk: any, spriteSleep: any, spriteSet: any;
let nikoWalk: string, nikoSleep: string;

export let mouse: Mouse;
export let oniko: Oniko;

// Clean up Niko before the window unloads.
window.addEventListener("beforeunload", function () {
    const existingNiko = document.getElementById("oniko");
    if (existingNiko) {
        existingNiko.remove();
    }
});

browser.storage.local.get(["nikoPosX", "nikoPosY", "mousePosX", "mousePosY", "isSleeping", "sleepFrameSpeed", "nikoSpeed", "idleTime", "sprite", "movement"]).then((result) => {
    oniko.x = result.nikoPosX || 32;
    oniko.y = result.nikoPosY || 32;
    mouse.x = result.mousePosX || 0;
    mouse.y = result.mousePosY || 0;
    oniko.isSleeping = result.isSleeping || false;
    oniko.sleepFrameSpeed = result.sleepFrameSpeed || 0.1;
    oniko.speed = result.nikoSpeed || 10;
    oniko.idleTime = result.idleTime || 60000;
    sprite = result.sprite || "Niko";
    oniko.movementType = result.movement || "new";

    //Enable easter egg
    if (oniko.idleTime === 143000) {
        initBattleUI()
        initHazards()

        isFight = true;
        window.setFight(true)

        vignette.updateVignette(player);

        function stopWheelEvent(event: { preventDefault: () => void; }) {
            event.preventDefault();
        }
        window.addEventListener('wheel', stopWheelEvent, { passive: false });
    }

    fetch(browser.runtime.getURL("img/" + sprite + "/meta.json"))
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
export function setSprite(name: string, frame: number, state: string) {
    if (state === "walk" && spriteWalk) {
        spriteSet = spriteWalk;
        oniko.width = spriteWalk.width || 48;
        oniko.height = spriteWalk.height || 64;
        nikoElement.style.backgroundImage = `url(${nikoWalk})`;
    }

    if (state === "sleep" && spriteSleep) {
        spriteSet = spriteSleep;
        oniko.width = spriteSleep.width;
        oniko.height = spriteSleep.height;
        nikoElement.style.backgroundImage = `url(${nikoSleep})`;
    }

    if (name !== undefined && spriteSet) {
        nikoElement.style.width = oniko.width + 'px';
        nikoElement.style.height = oniko.height + 'px';
        const sprite = spriteSet[name][frame % spriteSet[name].length];
        nikoElement.style.backgroundPosition = `${sprite[0] * oniko.width}px ${sprite[1] * oniko.height}px`;
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
    nikoElement.ariaHidden = "true";
    nikoElement.style.position = "fixed";
    nikoElement.style.pointerEvents = "none";
    nikoElement.style.imageRendering = "pixelated";
    nikoElement.style.zIndex = (2147483647).toString();

    nikoElement.style.setProperty("margin", "0px", "important");
    nikoElement.style.setProperty("padding", "0px", "important");
    nikoElement.style.setProperty("background-color", "transparent", "important");
    nikoElement.style.setProperty("box-shadow", "0px 0px 0px 0px transparent", "important");

    document.body.appendChild(nikoElement);

    mouse = new Mouse();
    oniko = new Oniko();

    browser.storage.local.get(['nikoPosX', 'nikoPosY', 'mousePosX', 'mousePosY', 'isSleeping']).then((result) => {
        oniko.x = result.nikoPosX || 32;
        oniko.y = result.nikoPosY || 32;
        mouse.x = result.mousePosX || undefined;
        mouse.y = result.mousePosY || undefined;
        oniko.isSleeping = result.isSleeping || undefined;
    });

    resetSleepTimer(oniko.isBlocked);

    window.requestAnimationFrame(onAnimationFrame);

    if (isFight) {
        moveNikoRandom()
    }

    document.addEventListener('mousemove', (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
        resetSleepTimer(oniko.isBlocked);
    });
}

init();

/* ------------------------------- */
/* ---------- ANIMATION ---------- */
/* ------------------------------- */

function setNikoPosX(value: number) {
    oniko.x = value
}

function setNikoPosY(value: number) {
    oniko.y = value
}

function setNikoIsSleeping(value: boolean) {
    oniko.isSleeping = value
}

function setNikoIsBlocked(value: boolean) {
    oniko.isBlocked = value
}

function frame() {
    let diffArr = mouse.calculateDiff()
    let distance = mouse.calculateDistance(diffArr)
    let normalizedArr = mouse.calculateVector(distance, diffArr);
    let direction = mouse.getDirection(normalizedArr)

    // Start sleep timer if Niko is near the mouse and not already sleeping.
    if (distance < 128 && !oniko.sleepTimer && !oniko.isSleeping) {
        oniko.sleepTimer = setTimeout(() => {
            oniko.isSleeping = true;
            oniko.sleepFrameCount = 0;
        }, oniko.idleTime);
    }

    if (oniko.isSleeping) {
        setSprite(direction, Math.floor(oniko.sleepFrameCount), "sleep");
        oniko.sleepFrameCount += oniko.sleepFrameSpeed;
        return;
    }

    if (oniko.movementType == "new") {
        nikoMovement(distance, normalizedArr, diffArr);
    } else if (oniko.movementType == "legacy") {
        legacyNikoMovement(distance, normalizedArr, diffArr);
    }
}

// Primary animation loop.
function onAnimationFrame(timestamp: number) {
    if (!nikoElement.isConnected) return;
    if (document.hidden) return;

    oniko.frameCount += 1

    if (!oniko.lastFrameTimestamp) oniko.lastFrameTimestamp = timestamp;
    if (timestamp - oniko.lastFrameTimestamp > 75) {
        oniko.lastFrameTimestamp = timestamp;
        if (isFight) {
            fightFrame()
        } else {
            frame();
        }
    }
    window.requestAnimationFrame(onAnimationFrame);
}

function nikoMovement(distance: number, normalizedArr: [number, number], diffArr: [number, number]) {
    let diffX = diffArr[0];
    let diffY = diffArr[1];

    let direction = mouse.getDirection(normalizedArr);

    // If niko is closer than 64 go further from mouse
    if (distance < 96) {
        oniko.x += (diffX / distance) * oniko.speed;
        oniko.y += (diffY / distance) * oniko.speed;
    }
    // If niko is in position between 64 and 128 stand still
    else if (distance > 64 && distance < 128) {
        setSprite(direction || "idle", 0, "walk");
        return;
    }
    // Else go to mouse
    else {
        oniko.x -= (diffX / distance) * oniko.speed;
        oniko.y -= (diffY / distance) * oniko.speed;
    }

    setSprite(direction, oniko.frameCount, "walk");

    updateNikoPosition();
}

function legacyNikoMovement(distance: number, normalizedArr: [number, number], diffArr: [number, number]) {
    let diffX = diffArr[0];
    let diffY = diffArr[1];

    let direction = mouse.getDirection(normalizedArr);

    // Stop animation if Niko is close to the mouse.
    if (distance < oniko.width || distance < oniko.height) {
        setSprite(direction || "idle", 0, "walk");
        return;
    }

    oniko.x -= (diffX / distance) * oniko.speed;
    oniko.y -= (diffY / distance) * oniko.speed;

    setSprite(direction, oniko.frameCount, "walk");

    updateNikoPosition();
}

function resetSleepTimer(isBlocked: boolean) {
    if (isBlocked) {
        return;
    }

    if (oniko.sleepTimer !== null) {
        clearTimeout(oniko.sleepTimer);
    }

    oniko.sleepTimer = null;
    if (oniko.isSleeping) {
        oniko.isSleeping = false;
        oniko.sleepFrameCount = 0;
    }
}

/* -------------------------- */
/* ---------- SYNC ---------- */
/* -------------------------- */

export function updateNikoPosition() {
    nikoElement.style.left = `${oniko.x - 24}px`;
    nikoElement.style.top = `${oniko.y - 32}px`;

    let nikoPosX = oniko.x
    let nikoPosY = oniko.y
    let mousePosX = mouse.x;
    let mousePosY = mouse.y;
    let isSleeping = oniko.isSleeping;

    browser.runtime.sendMessage({
        action: "updateNikoPosition", nikoPosX, nikoPosY, mousePosX, mousePosY, isSleeping
    });
}

browser.runtime.onMessage.addListener(function (request) {
    oniko.x = request.nikoPosX;
    oniko.y = request.nikoPosY;
    mouse.x = request.mousePosX;
    mouse.y = request.mousePosY;
    oniko.isSleeping = request.isSleeping;
});

// Handle tab visibility changes.
window.addEventListener("visibilitychange", function () {
    if (!document.hidden) {
        // When the tab becomes active, load the last known position from storage.
        browser.storage.local.get(['nikoPosX', 'nikoPosY', 'mousePosX', 'mousePosY', 'isSleeping']).then((result) => {
            oniko.x = result.nikoPosX || oniko.x;
            oniko.y = result.nikoPosY || oniko.y;
            mouse.x = result.mousePosX || mouse.x;
            mouse.y = result.mousePosY || mouse.y;
            oniko.isSleeping = result.isSleeping || oniko.isSleeping;
            // Restart the animation loop.
            resetSleepTimer(oniko.isBlocked);
            window.requestAnimationFrame(onAnimationFrame);
        });
    }
});
