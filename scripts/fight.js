const { increaseIntensity } = require('./viegnette.js');

function createGlitchElements() {
  // Random count from 4 to 8
  const count = Math.floor(Math.random() * 5) + 4;
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

  // Delete glitches after 2 seconds
  setTimeout(() => {
      elements.forEach(element => {
          document.body.removeChild(element);
      });
  }, 2000);
}

function createLine(warn) {
  const line = document.createElement("div");
  line.style.position = "absolute";
  line.style.zIndex = 1000; 
  line.style.backgroundColor = "purple";
  line.style.width = "30px";
  line.style.height = "100vh";
  line.style.top = "0px";
  line.style.left = warn.style.left;

  if (warn.style.width === "100vw") {
    line.style.width = "100vw";
    line.style.height = "30px";
    line.style.top = warn.style.top;
    line.style.left = "0px";
  }

  document.body.appendChild(line);

  // Do damage if mouse touches attack
  line.addEventListener("mouseover", (e) => {
    increaseIntensity();
    createGlitchElements();
  });

  // Delete line after 2 seconds
  setTimeout(() => {
    line.remove();
    warn.remove();
  }, 3000);
}

function warnLine() {
  const warn = document.createElement("div");
  warn.style.position = "absolute";
  warn.style.zIndex = 1000; 
  warn.style.backgroundColor = "rgba(128, 0, 128, 0.5)";
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
  square.style.backgroundColor = "purple"; 
  square.style.width = "30px";
  square.style.height = "30px";
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
    increaseIntensity();
    createGlitchElements();
  });
}

module.exports = { warnLine, createSquare, createGlitchElements };