import { vignette, player, enemy } from './battleUI'
import {updateNikoPosition, mouse, oniko, setSprite} from './content'
import { effects, homingHazard, lineHazard, squareHazard } from "./projectiles";
import { Character } from "./character";

let removalTimeout: NodeJS.Timeout | null = null;
let lineTimeout: NodeJS.Timeout | null = null;
let squareTimeout: NodeJS.Timeout | null = null;
let healTimeout: NodeJS.Timeout | null = null;
let homingTimeout: NodeJS.Timeout | null = null;

let isFight = false;

const FIGHT_CONFIG = {
    NIKO_MARGIN: 16,
    NIKO_ATTACK_COOLDOWN: 300,
    LINE_COOLDOWN_PHASE_0: 1000,
    LINE_COOLDOWN_PHASE_2: 600,
    SQUARE_COOLDOWN_PHASE_0: 25,
    SQUARE_COOLDOWN_PHASE_1: 35,
    HEAL_COOLDOWN: 30000,
    HOMING_COOLDOWN_PHASE_1: 7000,
    HOMING_COOLDOWN_PHASE_2: 500,
    ATTACK_DISTANCE_PADDING: 0.05,
};

window.isFight = isFight;
window.setFight = setFight;

function setFight(value: boolean) {
    isFight = value;
}

//TODO: Fix this. Its not random anymore (wtf)
export function moveNikoRandom() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const randomX = Math.floor(Math.random() * (screenWidth - 100));
    const randomY = Math.floor(Math.random() * (screenHeight - 100));
    window.setNikoPosX(randomX);
    window.setNikoPosY(randomY);

    updateNikoPosition();
}

function checkPhase(character: Character) {
    const percent = Math.max(0, Math.min(100, (character.health / Math.max(character.healthCap, 1)) * 100));
    const p = Math.max(0, Math.min(100, percent));

    if (p > 70) {
        character.phase = 0;
    } else if (p > 30) {
        character.phase = 1;
    } else {
        character.phase = 2;
    }
}

export function fightFrame() {
    if (!isFight) return;

    if (enemy.isDead) { showResult(true); return; }
    if (player.isDead) { showResult(false); return; }

    let diffArr = mouse.calculateDiff()
    let distance = mouse.calculateDistance(diffArr)

    setSprite(oniko.direction || "idle", 0, "walk");

    const minScreen = Math.min(window.innerWidth, window.innerHeight);
    const attackThreshold = minScreen * FIGHT_CONFIG.ATTACK_DISTANCE_PADDING;

    checkPhase(enemy)

    // Attack enemy if player is close
    if (distance > 0 && distance < attackThreshold) {
        if (!removalTimeout) {
            player.attacker(enemy, player, 0);
            effects.createGlitchElements();
            moveNikoRandom();

            // Start attack cooldown
            removalTimeout = setTimeout(() => { removalTimeout = null; }, FIGHT_CONFIG.NIKO_ATTACK_COOLDOWN);
        }
    }

    // Keep Niko inside screen
    window.setNikoPosX(Math.min(Math.max(FIGHT_CONFIG.NIKO_MARGIN, oniko.x), window.innerWidth - FIGHT_CONFIG.NIKO_MARGIN));
    window.setNikoPosY(Math.min(Math.max(FIGHT_CONFIG.NIKO_MARGIN, oniko.x), window.innerHeight - FIGHT_CONFIG.NIKO_MARGIN));

    lineHazard.checkLineCollision();

    // Helper to choose phase-based cooldown times
    // Shut up TS
    // @ts-ignore
    const getLineCooldown = () => (enemy.phase >= 2 ? FIGHT_CONFIG.LINE_COOLDOWN_PHASE_2 : FIGHT_CONFIG.LINE_COOLDOWN_PHASE_0);
    const getSquareCooldown = () => (enemy.phase === 0 ? FIGHT_CONFIG.SQUARE_COOLDOWN_PHASE_0 : FIGHT_CONFIG.SQUARE_COOLDOWN_PHASE_1);
    const getHomingCooldown = () => (enemy.phase === 1 ? FIGHT_CONFIG.HOMING_COOLDOWN_PHASE_1 : FIGHT_CONFIG.HOMING_COOLDOWN_PHASE_2);

    // Spawn line attacks
    if (!lineTimeout) {
        lineHazard.createWarnLine();
        lineTimeout = setTimeout(() => { lineTimeout = null; }, getLineCooldown());
    }

    // Spawn square attacks
    // Shut up twice
    // @ts-ignore
    if (enemy.phase < 2 && !squareTimeout) {
        squareHazard.createSquare();
        squareTimeout = setTimeout(() => { squareTimeout = null; }, getSquareCooldown());
    }

    // Spawn heals
    if (!healTimeout) {
        squareHazard.createHeal();
        healTimeout = setTimeout(() => { healTimeout = null; }, FIGHT_CONFIG.HEAL_COOLDOWN);
    }

    // Spawn homing
    // STFU TS
    // @ts-ignore
    if (enemy.phase > 0 && !homingTimeout) {
        homingHazard.createHoming();
        homingTimeout = setTimeout(() => { homingTimeout = null; }, getHomingCooldown());
    }

    updateNikoPosition();
}

function createEndOverlay(message: string, accent: string, btnLabel: string) {
    // Don't look at this. It just works.
    // Yeah, I can put that in css file. But im too lazy, shut up
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
