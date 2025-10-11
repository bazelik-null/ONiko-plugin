/* -------------------------------- */
/* ---------- ONIKO MAIN ---------- */
/* -------------------------------- */

import {initBattleUI, player, vignette} from './battleUI';
import {fightFrame, moveNikoRandom} from "./fight";
import {initHazards} from "./projectiles";

const nikoElement = document.createElement("div");

export let direction: string
export let nikoPosX: number;
export let nikoPosY: number;

export let width: number;
export let height: number;

export let isBlocked = false;
export let isSleeping: boolean;

window.setNikoPosX = setNikoPosX
window.setNikoPosY = setNikoPosY
window.setNikoIsSleeping = setNikoIsSleeping
window.setNikoIsBlocked = setNikoIsBlocked
let isFight = window.isFight;

let nikoSpeed: number;
let sleepFrameSpeed: number;
let idleTime: number;
let movementType: string;

let frameCount = 0;
let sleepFrameCount = 0;
let lastFrameTimestamp: number;
let sleepTimer: NodeJS.Timeout | null = null;

let sprite: string;

let spriteWalk: any, spriteSleep: any, spriteSet: any;
let nikoWalk: string, nikoSleep: string;

export let mouse: Mouse;

// Clean up Niko before the window unloads.
window.addEventListener("beforeunload", function () {
    const existingNiko = document.getElementById("oniko");
    if (existingNiko) {
        existingNiko.remove();
    }
});

browser.storage.local.get(["nikoPosX", "nikoPosY", "mousePosX", "mousePosY", "isSleeping", "sleepFrameSpeed", "nikoSpeed", "idleTime", "sprite", "movement"]).then((result) => {
    nikoPosX = result.nikoPosX || 32;
    nikoPosY = result.nikoPosY || 32;
    mouse.x = result.mousePosX || 0;
    mouse.y = result.mousePosY || 0;
    isSleeping = result.isSleeping || false;
    sleepFrameSpeed = result.sleepFrameSpeed || 0.1;
    nikoSpeed = result.nikoSpeed || 10;
    idleTime = result.idleTime || 60000;
    sprite = result.sprite || "Niko";
    movementType = result.movement || "new";

    //Enable easter egg
    if (idleTime === 143000) {
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

export class Mouse {
    public x: number;
    public y: number;

    public calculateDiff() : [number, number] {
        const diffX = nikoPosX - (this.x || nikoPosX);
        const diffY = nikoPosY - (this.y || nikoPosY);

        return [diffX, diffY];
    }

    public calculateDistance(diffArr: [number, number]) : number {
        let diffX = diffArr[0]
        let diffY = diffArr[1]

        return Math.hypot(diffX, diffY);
    }

    public calculateVector(distance: number, diffArr: [number, number]) : [number, number] {
        let diffX = diffArr[0]
        let diffY = diffArr[1]

        const normalizedX = diffX / distance;
        const normalizedY = diffY / distance;

        return [normalizedX, normalizedY];
    }

    public getDirection(normalizedArr: [number, number]) : string {
        let normalizedX = normalizedArr[0];
        let normalizedY = normalizedArr[1];

        if (normalizedY > 0.5) {
            direction = "N";
        } else if (normalizedY < -0.5) {
            direction = "S";
        } else if (normalizedX > 0.5) {
            direction = "W";
        } else if (normalizedX < -0.5) {
            direction = "E";
        }
        return direction;
    }

    constructor() {
        this.x = 0;
        this.y = 0;
    }
}

/* ------------------------------------- */
/* ---------- SPRITE HANDLING ---------- */
/* ------------------------------------- */

// Update the sprite based on the given frame count.
export function setSprite(name: string, frame: number, state: string) {
    if (state === "walk" && spriteWalk) {
        spriteSet = spriteWalk;
        width = spriteWalk.width || 48;
        height = spriteWalk.height || 64;
        nikoElement.style.backgroundImage = `url(${nikoWalk})`;
    }

    if (state === "sleep" && spriteSleep) {
        spriteSet = spriteSleep;
        width = spriteSleep.width;
        height = spriteSleep.height;
        nikoElement.style.backgroundImage = `url(${nikoSleep})`;
    }

    if (name !== undefined && spriteSet) {
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

    browser.storage.local.get(['nikoPosX', 'nikoPosY', 'mousePosX', 'mousePosY', 'isSleeping']).then((result) => {
        nikoPosX = result.nikoPosX || 32;
        nikoPosY = result.nikoPosY || 32;
        mouse.x = result.mousePosX || undefined;
        mouse.y = result.mousePosY || undefined;
        isSleeping = result.isSleeping || undefined;
    });

    resetSleepTimer(isBlocked);

    window.requestAnimationFrame(onAnimationFrame);

    if (isFight) {
        moveNikoRandom()
    }

    document.addEventListener('mousemove', (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
        resetSleepTimer(isBlocked);
    });
}

init();

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
    let diffArr = mouse.calculateDiff()
    let distance = mouse.calculateDistance(diffArr)
    let normalizedArr = mouse.calculateVector(distance, diffArr);
    let direction = mouse.getDirection(normalizedArr)

    // Start sleep timer if Niko is near the mouse and not already sleeping.
    if (distance < 128 && !sleepTimer && !isSleeping) {
        sleepTimer = setTimeout(() => {
            isSleeping = true;
            sleepFrameCount = 0;
        }, idleTime);
    }

    if (isSleeping) {
        setSprite(direction, Math.floor(sleepFrameCount), "sleep");
        sleepFrameCount += sleepFrameSpeed;
        return;
    }

    if (movementType == "new") {
        nikoMovement(distance, normalizedArr, diffArr);
    } else if (movementType == "legacy") {
        legacyNikoMovement(distance, normalizedArr, diffArr);
    }
}

// Primary animation loop.
function onAnimationFrame(timestamp: number) {
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

function nikoMovement(distance: number, normalizedArr: [number, number], diffArr: [number, number]) {
    let diffX = diffArr[0];
    let diffY = diffArr[1];

    let direction = mouse.getDirection(normalizedArr);

    // If niko is closer than 64 go further from mouse
    if (distance < 96) {
        nikoPosX += (diffX / distance) * nikoSpeed;
        nikoPosY += (diffY / distance) * nikoSpeed;
    }
    // If niko is in position between 64 and 128 stand still
    else if (distance > 64 && distance < 128) {
        setSprite(direction || "idle", 0, "walk");
        return;
    }
    // Else go to mouse
    else {
        nikoPosX -= (diffX / distance) * nikoSpeed;
        nikoPosY -= (diffY / distance) * nikoSpeed;
    }

    setSprite(direction, frameCount, "walk");

    updateNikoPosition();
}

function legacyNikoMovement(distance: number, normalizedArr: [number, number], diffArr: [number, number]) {
    let diffX = diffArr[0];
    let diffY = diffArr[1];

    let direction = mouse.getDirection(normalizedArr);

    // Stop animation if Niko is close to the mouse.
    if (distance < width || distance < height) {
        setSprite(direction || "idle", 0, "walk");
        return;
    }

    nikoPosX -= (diffX / distance) * nikoSpeed;
    nikoPosY -= (diffY / distance) * nikoSpeed;

    setSprite(direction, frameCount, "walk");

    updateNikoPosition();
}

function resetSleepTimer(isBlocked: boolean) {
    if (isBlocked) {
        return;
    }

    if (sleepTimer !== null) {
        clearTimeout(sleepTimer);
    }

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

    let mousePosX = mouse.x;
    let mousePosY = mouse.y;

    browser.runtime.sendMessage({
        action: "updateNikoPosition", nikoPosX, nikoPosY, mousePosX, mousePosY, isSleeping
    });
}

browser.runtime.onMessage.addListener(function (request) {
    nikoPosX = request.nikoPosX;
    nikoPosY = request.nikoPosY;
    mouse.x = request.mousePosX;
    mouse.y = request.mousePosY;
    isSleeping = request.isSleeping;
});

// Handle tab visibility changes.
window.addEventListener("visibilitychange", function () {
    if (!document.hidden) {
        // When the tab becomes active, load the last known position from storage.
        browser.storage.local.get(['nikoPosX', 'nikoPosY', 'mousePosX', 'mousePosY', 'isSleeping']).then((result) => {
            nikoPosX = result.nikoPosX || nikoPosX;
            nikoPosY = result.nikoPosY || nikoPosY;
            mouse.x = result.mousePosX || mouse.x;
            mouse.y = result.mousePosY || mouse.y;
            isSleeping = result.isSleeping || isSleeping;
            // Restart the animation loop.
            resetSleepTimer(isBlocked);
            window.requestAnimationFrame(onAnimationFrame);
        });
    }
});
