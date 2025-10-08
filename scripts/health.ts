import {Character} from "./healthUtils";

const canvas = document.createElement('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

export let player: Character;
export let enemy: Character;
export let vignette: Vignette;

function init() {
    document.body.appendChild(canvas);
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    player = new Character(100, 100, 0, 5, null)
    enemy = new Character(100, 100, 0, 5, 0)
    vignette = new Vignette();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

export class Vignette {
    drawVignette(damage: number) {
        const width = canvas.width;
        const height = canvas.height;

        const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) / 2);
        gradient.addColorStop(0, `rgba(134, 0, 0, 0)`); // Transparent center
        gradient.addColorStop(1, `rgba(134, 0, 0, ${damage / 100})`); // Red vignette

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    updateVignette(player: Character) {
        const maxHealthCap = 100;
        const scale = maxHealthCap / Math.max(player.healthCap, 1);

        const scaledHealthCap = player.healthCap * scale;
        const scaledHealth = player.health * scale;

        let damage = scaledHealthCap - scaledHealth;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.drawVignette(damage);
    }
}

export function createHpBarPlayer() {
    player.hpBar = document.createElement('div');
    player.hpBar.style.position = 'fixed';
    player.hpBar.style.top = '10%';
    player.hpBar.style.left = '50%';
    player.hpBar.style.transform = 'translateX(-50%)';
    player.hpBar.style.width = '200px';
    player.hpBar.style.height = '20px';
    player.hpBar.style.border = '1px solid black';
    player.hpBar.style.zIndex = '1001';

    player.innerBar = document.createElement('div');
    player.innerBar.style.height = '100%';
    player.innerBar.style.background = 'linear-gradient(to right, green 100%, green 100%, red 0%)';

    const textElement = document.createElement('div');
    textElement.innerText = 'Player HP:';
    textElement.style.position = 'fixed';
    textElement.style.top = '90%';
    textElement.style.left = '50%';
    textElement.style.transform = 'translateX(-50%)';
    textElement.style.zIndex = '1002';
    player.hpBar.appendChild(player.innerBar);
    player.hpBar.appendChild(textElement);
    document.body.appendChild(player.hpBar);
}

export function createHpBarNiko() {
    enemy.hpBar = document.createElement('div');
    enemy.hpBar.style.position = 'fixed';
    enemy.hpBar.style.top = '90%';
    enemy.hpBar.style.left = '50%';
    enemy.hpBar.style.transform = 'translateX(-50%)';
    enemy.hpBar.style.width = '200px';
    enemy.hpBar.style.height = '20px';
    enemy.hpBar.style.border = '1px solid black';
    enemy.hpBar.style.zIndex = '1001';

    enemy.innerBar = document.createElement('div');
    enemy.innerBar.style.height = '100%';
    enemy.innerBar.style.background = 'linear-gradient(to right, green 100%, green 100%, red 0%)';

    const textElement = document.createElement('div');
    textElement.innerText = 'TWM HP:';
    textElement.style.position = 'fixed';
    textElement.style.top = '90%';
    textElement.style.left = '50%';
    textElement.style.transform = 'translateX(-50%)';
    textElement.style.zIndex = '1002';

    enemy.hpBar.appendChild(enemy.innerBar);
    enemy.hpBar.appendChild(textElement);
    document.body.appendChild(enemy.hpBar);
}

init()