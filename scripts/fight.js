const { increaseDamage, decreaseDamage } = require('./hp.js');

const homingSpeed = 5;
let mousePosX = 0;
let mousePosY = 0;

function createGlitchElements() {
  const count = 3
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

  // Delete glitches after 1 second
  setTimeout(() => {
      elements.forEach(element => {
          document.body.removeChild(element);
      });
  }, 1000);
}

function createLine(warn) {
  const line = document.createElement("div");
  line.style.position = "absolute";
  line.style.zIndex = 1000; 
  line.style.backgroundColor = "rgb(66, 0, 128)";
  line.style.width = "25px";
  line.style.height = "100vh";
  line.style.top = "0px";
  line.style.left = warn.style.left;

  if (warn.style.width === "100vw") {
    line.style.width = "100vw";
    line.style.height = "25px";
    line.style.top = warn.style.top;
    line.style.left = "0px";
  }

  document.body.appendChild(line);

  // Do damage if mouse touches attack
  line.addEventListener("mouseover", (e) => {
    increaseDamage();
    createGlitchElements();
  });

  // Delete line after 2 seconds
  setTimeout(() => {
    line.remove();
    warn.remove();
  }, 1000);
}

function warnLine() {
  const warn = document.createElement("div");
  warn.style.position = "absolute";
  warn.style.zIndex = 1000; 
  warn.style.backgroundColor = "rgba(66, 0, 128, 0.5)";
  warn.style.width = "10px";
  warn.style.height = "100vh";
  warn.style.top = "0px";
  warn.style.left = `${Math.floor(Math.random() * (window.innerWidth - 1))}px`;
  
  if (Math.random() > 0.5) {
    warn.style.width = "100vw"; 
    warn.style.height = "10px";
    warn.style.top = `${Math.floor(Math.random() * (window.innerHeight - 1))}px`;
    warn.style.left = "0px";
  }

  document.body.appendChild(warn);

  // Create line after 1 second of waiting
  setTimeout(() => {
    createLine(warn);
  }, 1000);
}

function createSquare() {
  const square = document.createElement("div");
  square.style.position = "absolute";
  square.style.zIndex = 1000; 
  square.style.backgroundColor = "rgb(66, 0, 128)"; 
  square.style.width = "20px";
  square.style.height = "20px";
  square.style.top = "0px";
  square.style.left = Math.random() * (window.innerWidth - 30) + "px";

  document.body.appendChild(square);

  // Falling anim
  let positionY = 0;
  let positionX = Math.random() < 0.5 ? -5 : 5; // Random horisontal direction

  const interval = setInterval(() => {
    positionY += 5;
    square.style.top = positionY + "px";

    const currentLeft = parseFloat(square.style.left);
    square.style.left = (currentLeft + positionX) + "px";

    if (positionY > window.innerHeight) {
      clearInterval(interval);
      square.remove();
    }

    if (parseFloat(square.style.left) < 0 || parseFloat(square.style.left) > window.innerWidth - 30) {
      positionX = -positionX;
    }
  }, 50); // Update interval

  // Do damage if mouse touches attack
  square.addEventListener("mouseover", (e) => {
    increaseDamage();
    createGlitchElements();
    square.remove();
  });
}

// Обработчик движения мыши
document.addEventListener("mousemove", (event) => {
  mousePosX = event.clientX;
  mousePosY = event.clientY;
});

function createHoming() {
  const homing = document.createElement("div");
  homing.style.position = "absolute";
  homing.style.zIndex = 1000; 
  homing.style.width = "0";
  homing.style.height = "0";
  homing.style.borderLeft = "15px solid transparent";
  homing.style.borderRight = "15px solid transparent";
  homing.style.borderBottom = "30px solid rgb(66, 0, 128)";
  document.body.appendChild(homing);

  let homingPosX = Math.random() * window.innerWidth;
  let homingPosY = Math.random() * window.innerHeight;
  homing.style.top = `${homingPosY}px`;
  homing.style.left = `${homingPosX}px`;

  function moveHoming() {
    const diffX = homingPosX - mousePosX;
    const diffY = homingPosY - mousePosY;
    const distance = Math.hypot(diffX, diffY);

    if (distance) {
      const normalizedX = diffX / distance;
      const normalizedY = diffY / distance;

      const angle = Math.atan2(normalizedY, normalizedX) * (180 / Math.PI);
      homing.style.transform = `rotate(${angle}deg)`;

      homingPosX -= (diffX / distance) * homingSpeed;
      homingPosY -= (diffY / distance) * homingSpeed;

      homing.style.top = `${homingPosY}px`;
      homing.style.left = `${homingPosX}px`;
    }

    if (Math.abs(homingPosX - mousePosX) < 30 && Math.abs(homingPosY - mousePosY) < 30) {
      increaseDamage();
      homing.remove();
      createGlitchElements();
    } else {
      requestAnimationFrame(moveHoming);
    }
  }

  moveHoming();

  // Удаляем треугольник через 5 секунд
  setTimeout(() => {
    homing.remove();
  }, 5000);
}

function createHeal() {
  const heal = document.createElement("div");
  heal.style.position = "absolute";
  heal.style.zIndex = 1000; 
  heal.style.backgroundColor = "green"; 
  heal.style.width = "20px";
  heal.style.height = "20px";
  heal.style.top = "0px";
  heal.style.left = Math.random() * (window.innerWidth - 30) + "px";

  document.body.appendChild(heal);

  // Falling anim
  let positionY = 0;
  let positionX = Math.random() < 0.5 ? -5 : 5; // Random horisontal direction

  const interval = setInterval(() => {
    positionY += 5;
    heal.style.top = positionY + "px";

    const currentLeft = parseFloat(heal.style.left);
    heal.style.left = (currentLeft + positionX) + "px";

    if (positionY > window.innerHeight) {
      clearInterval(interval);
      heal.remove();
    }

    if (parseFloat(heal.style.left) < 0 || parseFloat(heal.style.left) > window.innerWidth - 30) {
      positionX = -positionX;
    }
  }, 50); // Update interval

  // Do damage if mouse touches attack
  heal.addEventListener("mouseover", (e) => {
    decreaseDamage();
    heal.remove();
  });
}

module.exports = { warnLine, createSquare, createHeal, createGlitchElements, createHoming };