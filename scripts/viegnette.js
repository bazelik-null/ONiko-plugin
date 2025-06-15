const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.pointerEvents = 'none';

let intensity = 0;
let maxHp = 100;

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
    }
    updateVignette(intensity)
    updateHpBar();
}

function createHpBar() {
    hpBar = document.createElement('div');
    hpBar.style.position = 'fixed';
    hpBar.style.top = '10px'; // Расстояние от верхнего края экрана
    hpBar.style.left = '50%';
    hpBar.style.transform = 'translateX(-50%)'; // Центрирование по горизонтали
    hpBar.style.width = '200px'; // Ширина HP бара
    hpBar.style.height = '20px'; // Высота HP бара
    hpBar.style.border = '1px solid black';
    hpBar.style.zIndex = '1000'; // Установите высокий z-index, чтобы HP бар был виден поверх других элементов

    innerBar = document.createElement('div');
    innerBar.style.height = '100%';
    innerBar.style.background = 'linear-gradient(to right, green 100%, green 100%, red 0%)'; // Начальный цвет HP бара

    hpBar.appendChild(innerBar);
    document.body.appendChild(hpBar);
}

function updateHpBar() {
    let currentHp = maxHp - intensity; // Рассчитайте текущее HP
    
    if (currentHp < 0) currentHp = 0; // Ограничите минимальное значение HP
    
    let width = (currentHp / maxHp) * 100 + '%'; // Рассчитайте ширину HP бара
    innerBar.style.background = `linear-gradient(to right, green ${width}, red ${width})`;
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


module.exports = { updateVignette, createHpBar, increaseIntensity };