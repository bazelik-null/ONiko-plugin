import { vignette, player, enemy } from './health'
import { setSprite, updateNikoPosition, direction, nikoPosX, nikoPosY, mousePosX, mousePosY, width, height } from './content'
import { createWarnLine, createSquare, createHeal, createGlitchElements, createHoming, checkLineCollision } from "./projectiles";

//TODO: Better refactor this. Looks bad to me.

let removalTimeout: NodeJS.Timeout | null = null;
let lineTimeout: NodeJS.Timeout | null = null;
let squareTimeout: NodeJS.Timeout | null = null;
let healTimeout: NodeJS.Timeout | null = null;
let homingTimeout: NodeJS.Timeout | null = null;

let isFight = false;

window.isFight = isFight;
window.setFight = setFight;

function setFight(value: boolean) {
    isFight = value;
}
export function moveNikoRandom() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const randomX = Math.floor(Math.random() * (screenWidth - 100));
    const randomY = Math.floor(Math.random() * (screenHeight - 100));
    window.setNikoPosX(randomX);
    window.setNikoPosY(randomY);

    updateNikoPosition();
}

export function fightFrame() {
    if (!isFight) {
        return;
    }

    if (enemy.phase == null) {
        return;
    }

    if (enemy.isDead) {
        showResult(true);
        return;
    }

    if (player.isDead) {
        showResult(false);
        return;
    }

    const diffX = nikoPosX - (mousePosX || nikoPosX);
    const diffY = nikoPosY - (mousePosY || nikoPosY);
    const distance = Math.hypot(diffX, diffY);

    setSprite(direction || "idle", 0, "walk");

    if (distance && (distance < width || distance < height)) {
        // Attack niko
        if (!removalTimeout) {
            player.attacker(enemy, player, 0)
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

    // Spawn line attacks
    if (!lineTimeout) {
        createWarnLine();
        if (enemy.phase < 2) {
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
    if (!squareTimeout && enemy.phase < 2) {
        createSquare();
        if (enemy.phase === 0) {
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
    if (!homingTimeout && enemy.phase > 0) {
        createHoming();
        if (enemy.phase === 1) {
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

function createEndOverlay(message: string, accent: string, btnLabel: string) {
    const backdrop = document.createElement('div');
    backdrop.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.45);backdrop-filter:blur(4px);z-index:10000;';
    const card = document.createElement('div');
    card.style.cssText = 'min-width:320px;padding:22px;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,0.5);text-align:center;color:#fff;'
        + 'background:linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0.5));border:1px solid rgba(255,255,255,0.06);';
    const title = document.createElement('div');
    title.textContent = message;
    title.style.cssText = `font-size:38px;font-weight:800;margin-bottom:10px;color:${accent};`;
    const subtitle = document.createElement('div');
    subtitle.style.cssText = 'font-size:13px;opacity:.95;margin-bottom:18px;';
    const btn = document.createElement('button');
    btn.textContent = btnLabel;
    btn.style.cssText = 'padding:10px 18px;border-radius:8px;border:none;cursor:pointer;font-weight:700;';
    btn.onclick = () => location.reload();

    card.appendChild(title);
    card.appendChild(subtitle);
    card.appendChild(btn);
    backdrop.appendChild(card);
    document.body.appendChild(backdrop);

    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') location.reload(); }
    window.addEventListener('keydown', onKey);
}

function showResult(isWin: boolean) {
    isFight = false;
    window.setNikoIsSleeping(true);
    window.setNikoIsBlocked(true);
    window.removeEventListener('wheel', window.stopWheelEvent);

    if (isWin) {
        const options = { idleTime: 60000 };
        browser.storage.local.set(options);
        player.healer(player, player.healthCap);
        vignette.updateVignette(player);
        createEndOverlay('YOU WON!', '#6aff7a', 'Continue');
    } else {
        vignette.updateVignette(player);
        createEndOverlay('YOU LOST.', '#ff6b6b', 'Retry');
    }
}
