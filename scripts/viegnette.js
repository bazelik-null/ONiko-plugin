const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.pointerEvents = 'none';

let intensity = 0;
let maxHp = 100;
let timer = 180; // 3 min

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function drawVignette(intensity) {
    const width = canvas.width;
    const height = canvas.height;

    const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) / 2);
    gradient.addColorStop(0, `rgba(255, 0, 0, 0)`); // Transparent center
    gradient.addColorStop(1, `rgba(255, 0, 0, ${intensity / 100})`); // Red viegnette

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
}

function updateVignette(intensity) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawVignette(intensity);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function increaseIntensity() {
    intensity += 5;
    if (intensity >= 100) {
        createGlitchElementsEnd()
        intensity = 100
        clearInterval(timerInterval);
    }
    updateVignette(intensity)
    updateHpBar();
}

function decreaseIntensity() {
    intensity -= 25;
    if (intensity <= 0) {
        intensity = 0
    }
    updateVignette(intensity)
    updateHpBar();
}

function createHpBar() {
    hpBar = document.createElement('div');
    hpBar.style.position = 'fixed';
    hpBar.style.top = '10px';
    hpBar.style.left = '50%';
    hpBar.style.transform = 'translateX(-50%)';
    hpBar.style.width = '200px';
    hpBar.style.height = '20px';
    hpBar.style.border = '1px solid black';
    hpBar.style.zIndex = '1001';

    innerBar = document.createElement('div');
    innerBar.style.height = '100%';
    innerBar.style.background = 'linear-gradient(to right, green 100%, green 100%, red 0%)';

    hpBar.appendChild(innerBar);
    document.body.appendChild(hpBar);

    createTimer();
    createLabel();
}

function updateHpBar() {
    let currentHp = maxHp - intensity;
    
    if (currentHp < 0) currentHp = 0;
    
    let width = (currentHp / maxHp) * 100 + '%';
    innerBar.style.background = `linear-gradient(to right, green ${width}, red ${width})`;
}

function createTimer() {
    timerElement = document.createElement('div');
    timerElement.style.position = 'fixed';
    timerElement.style.top = '40px';
    timerElement.style.left = '50%';
    timerElement.style.transform = 'translateX(-50%)';
    timerElement.style.fontSize = '24px';
    timerElement.style.fontWeight = 'bold';
    timerElement.style.zIndex = '1001';
    document.body.appendChild(timerElement);

    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    let minutes = Math.floor(timer / 60);
    let seconds = timer % 60;

    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    timer--;

    if (timer < 0) {
        timer = 0;
        timerElement.textContent = '00:00';
        window.win();
        clearInterval(timerInterval);
    }
}

function createLabel() {
    labelElement = document.createElement('div');
    labelElement.style.position = 'fixed';
    labelElement.style.top = '50%';
    labelElement.style.left = '50%';
    labelElement.style.transform = 'translateX(-50%)';
    labelElement.style.fontSize = '100px';
    labelElement.style.fontWeight = 'bold';
    labelElement.style.zIndex = '1001';
    labelElement.style.color = "red";
    document.body.appendChild(labelElement);

    labelElement.textContent = 'RUN FROM NIKO';

    setTimeout(() => {
    labelElement.remove();
  }, 2000);
}

// Spam with glitches
function createGlitchElementsEnd() {
  const count = 100
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


module.exports = { updateVignette, createHpBar, increaseIntensity, decreaseIntensity };