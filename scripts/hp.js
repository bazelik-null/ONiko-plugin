let isDied = false;
let isPhase2Blocked = false;
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.pointerEvents = 'none';

let damage = 0;
let maxHp = 100;
let nikoDamage = 0;
let nikoMaxHp = 200;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function drawVignette(damage) {
    const width = canvas.width;
    const height = canvas.height;

    const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) / 2);
    gradient.addColorStop(0, `rgba(134, 0, 0, 0)`); // Transparent center
    gradient.addColorStop(1, `rgba(134, 0, 0, ${damage / 100})`); // Red viegnette

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
}

function updateVignette(damage) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawVignette(damage);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function increaseDamage() {
    damage += 5;
    nikoDamage -= 1;
    if (damage >= maxHp) {
        createGlitchElementsEnd()
        damage = maxHp
        isDied = true
    }
    updateVignette(damage)
    updateHpBarPlayer();
    updateHpBarNiko();
}

function decreaseDamage() {
    damage -= 15;
    if (damage <= 0) {
        damage = 0
    }
    updateVignette(damage)
    updateHpBarPlayer();
}

function attackNiko() {
    nikoDamage += 5;
    let currentHp = nikoMaxHp - nikoDamage;

    if (nikoDamage >= nikoMaxHp) {
        nikoDamage = nikoMaxHp
        if (!isDied) {
            window.win()
        }
    }

    if (currentHp <= nikoMaxHp * 2 / 3 && !isPhase2Blocked) {
        window.startPhase2();
    }

    if (currentHp <= nikoMaxHp / 3) {
        window.startPhase3();
        isPhase2Blocked = true;
    }
    updateHpBarNiko();
}

function createHpBarPlayer() {
    hpBarPlayer = document.createElement('div');
    hpBarPlayer.style.position = 'fixed';
    hpBarPlayer.style.top = '10%';
    hpBarPlayer.style.left = '50%';
    hpBarPlayer.style.transform = 'translateX(-50%)';
    hpBarPlayer.style.width = '200px';
    hpBarPlayer.style.height = '20px';
    hpBarPlayer.style.border = '1px solid black';
    hpBarPlayer.style.zIndex = '1001';

    innerBarPlayer = document.createElement('div');
    innerBarPlayer.style.height = '100%';
    innerBarPlayer.style.background = 'linear-gradient(to right, green 100%, green 100%, red 0%)';

    const textElement = document.createElement('div');
    textElement.innerText = 'Player HP:';
    textElement.style.position = 'fixed';
    textElement.style.top = '90%';
    textElement.style.left = '50%';
    textElement.style.transform = 'translateX(-50%)';
    textElement.style.zIndex = '1002';
    hpBarPlayer.appendChild(innerBarPlayer);
    hpBarPlayer.appendChild(textElement);
    document.body.appendChild(hpBarPlayer);
}

function updateHpBarPlayer() {
    let currentHp = maxHp - damage;
    
    if (currentHp < 0) currentHp = 0;
    
    let width = (currentHp / maxHp) * 100 + '%';
    innerBarPlayer.style.background = `linear-gradient(to right, green ${width}, red ${width})`;
}

function createHpBarNiko() {
    hpBarNiko = document.createElement('div');
    hpBarNiko.style.position = 'fixed';
    hpBarNiko.style.top = '90%';
    hpBarNiko.style.left = '50%';
    hpBarNiko.style.transform = 'translateX(-50%)';
    hpBarNiko.style.width = '200px';
    hpBarNiko.style.height = '20px';
    hpBarNiko.style.border = '1px solid black';
    hpBarNiko.style.zIndex = '1001';

    innerBarNiko = document.createElement('div');
    innerBarNiko.style.height = '100%';
    innerBarNiko.style.background = 'linear-gradient(to right, green 100%, green 100%, red 0%)';

    const textElement = document.createElement('div');
    textElement.innerText = 'TWM HP:';
    textElement.style.position = 'fixed';
    textElement.style.top = '90%';
    textElement.style.left = '50%';
    textElement.style.transform = 'translateX(-50%)';
    textElement.style.zIndex = '1002';

    hpBarNiko.appendChild(innerBarNiko);
    hpBarNiko.appendChild(textElement);
    document.body.appendChild(hpBarNiko);
}

function updateHpBarNiko() {
    let currentHp = nikoMaxHp - nikoDamage;
    
    if (currentHp < 0) currentHp = 0;
    
    let width = (currentHp / nikoMaxHp) * 100 + '%';
    if (currentHp <= nikoMaxHp / 3) {
        innerBarNiko.style.background = `linear-gradient(to right,rgb(248, 104, 61) ${width}, red ${width})`;
    } else if (currentHp <= nikoMaxHp * 2 / 3 && !isPhase2Blocked) {
        innerBarNiko.style.background = `linear-gradient(to right, yellow ${width}, red ${width})`;
    } else {
        innerBarNiko.style.background = `linear-gradient(to right, green ${width}, red ${width})`;
    }
}

// Spam with glitches
function createGlitchElementsEnd() {
  const count = 300
  const elements = [];

  for (let i = 0; i < count; i++) {
      const div = document.createElement('div');
      div.style.width = '128px'; 
      div.style.height = '128px'; 
      div.style.backgroundImage = `url(${browser.runtime.getURL("img/glitch.png")})`; 
      div.style.backgroundSize = 'cover'; 
      div.style.position = 'absolute'; 
      div.style.top = `${Math.random() * 100}vh`;
      div.style.left = `${Math.random() * 100}vw`;
      div.style.zIndex = '9999'; 
      div.style.opacity = '1'; 
      div.style.backgroundColor = 'transparent'; 
      document.body.appendChild(div);
      elements.push(div);
  }
}


module.exports = { updateVignette, createHpBarPlayer, increaseDamage, decreaseDamage, attackNiko, createHpBarNiko };