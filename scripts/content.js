// Create the Niko element.
const nikoEl = document.createElement("div");

// Declare variables for Niko's position and state.
let nikoPosX, nikoPosY, mousePosX, mousePosY, isSleeping, nikoSpeed, sleepFrameSpeed, idleTime;

// Initialize values from storage.
browser.storage.local.get([
  "nikoPosX",
  "nikoPosY",
  "mousePosX",
  "mousePosY",
  "isSleeping",
  "sleepFrameSpeed",
  "nikoSpeed",
  "idleTime"
]).then((result) => {
  nikoPosX = result.nikoPosX || 32; // Initial X position
  nikoPosY = result.nikoPosY || 32; // Initial Y position
  mousePosX = result.mousePosX || 0; // Mouse X position (default 0)
  mousePosY = result.mousePosY || 0; // Mouse Y position (default 0)
  isSleeping = result.isSleeping || false; // Check if Niko is sleeping
  sleepFrameSpeed = result.sleepFrameSpeed || 0.1; // Default sleep animation speed
  nikoSpeed = result.nikoSpeed || 10; // Default moving speed
  idleTime = result.idleTime || 60000; // Idle time before sleep (60 seconds)
});

// Variables for sprite handling.
let dirParam = "";
let direction;
let frameCount = 0;
let sleepFrameCount = 0;
let SleepTimer;

// Sprite sets for different animations.
const spriteSets = {
  idle: [[0, 0]],

  SleepN: [[0, 1], [-1, 1], [-2, 1], [-3, 1]], // Sleep facing up
  SleepE: [[0, 2], [-1, 2], [-2, 2], [-3, 2]], // Sleep facing left
  SleepW: [[0, 3], [-1, 3], [-2, 3], [-3, 3]], // Sleep facing right
  SleepS: [[0, 4], [-1, 4], [-2, 4], [-3, 4]], // Sleep facing down

  N: [[0, 5], [-1, 5], [-2, 5], [-3, 5]], // Facing up
  NE: [[0, 5], [-1, 5], [-2, 6], [-3, 6]], // Facing up-right
  NW: [[0, 5], [-1, 5], [-2, 7], [-3, 7]], // Facing up-left

  E: [[0, 6], [-1, 6], [-2, 6], [-3, 6]], // Facing right

  W: [[0, 7], [-1, 7], [-2, 7], [-3, 7]], // Facing left

  S: [[0, 0], [-1, 0], [-2, 0], [-3, 0]], // Facing down
  SE: [[0, 0], [-1, 0], [-2, 6], [-3, 6]], // Facing down-right
  SW: [[0, 0], [-1, 0], [-2, 7], [-3, 7]]  // Facing down-left
};

/* -------------------------------- */
/* ---------- INIT ONIKO ---------- */
/* -------------------------------- */

function init() {
  // Remove the existing Niko element if present.
  const existingNiko = document.getElementById("oniko");
  if (existingNiko) {
    existingNiko.remove();
  }

  // Set attributes and styles for Niko.
  nikoEl.id = "oniko";
  nikoEl.ariaHidden = true;
  nikoEl.style.width = "48px";
  nikoEl.style.height = "64px";
  nikoEl.style.position = "fixed";
  nikoEl.style.pointerEvents = "none";
  nikoEl.style.imageRendering = "pixelated";
  nikoEl.style.zIndex = 2147483647;
  
  // Disable css overriding
  nikoEl.style.setProperty("margin", "0px", "important");
  nikoEl.style.setProperty("padding", "0px", "important");
  nikoEl.style.setProperty("background-color", "transparent", "important");
  nikoEl.style.setProperty("box-shadow", "0px 0px 0px 0px transparent", "important");

  // Set the background image (sprite sheet) for Niko.
  let nikoFile = browser.runtime.getURL("img/oniko.png");
  const curScript = document.currentScript;
  if (curScript && curScript.dataset.cat) {
    nikoFile = curScript.dataset.cat;
  }
  nikoEl.style.backgroundImage = `url(${nikoFile})`;

  document.body.appendChild(nikoEl);

  // Get any possibly stored values (position and sleep state) again.
  browser.storage.local.get(['nikoPosX', 'nikoPosY', 'mousePosX', 'mousePosY', 'isSleeping']).then((result) => {
    nikoPosX = result.nikoPosX || 32;
    nikoPosY = result.nikoPosY || 32;
    mousePosX = result.mousePosX || undefined;
    mousePosY = result.mousePosY || undefined;
    isSleeping = result.isSleeping || undefined;
  });

  resetSleepTimer();
  window.requestAnimationFrame(onAnimationFrame);

  // Update mouse position on movement.
  document.onmousemove = function (event) {
    mousePosX = event.clientX;
    mousePosY = event.clientY;
    resetSleepTimer();
    if (!document.hidden) { // Only animate if the tab is active.
      window.requestAnimationFrame(onAnimationFrame);
    }
  };
}

/* ----------------------------------- */
/* ---------- END INIT ONIKO --------- */
/* ----------------------------------- */

// Timestamp for animation frame regulation.
let lastFrameTimestamp;
// Primary animation loop.
function onAnimationFrame(timestamp) {
  if (!nikoEl.isConnected) return;
  if (document.hidden) return; // Do not update if the tab is inactive.
  if (!lastFrameTimestamp) lastFrameTimestamp = timestamp;
  if (timestamp - lastFrameTimestamp > 70) {
    lastFrameTimestamp = timestamp;
    frame(); // Update Niko's state and position.
  }
  window.requestAnimationFrame(onAnimationFrame);
}

// Listen for messages to update Niko's position from other sources.
browser.runtime.onMessage.addListener(function(request) {
  nikoPosX = request.nikoPosX;
  nikoPosY = request.nikoPosY;
  mousePosX = request.mousePosX;
  mousePosY = request.mousePosY;
  isSleeping = request.isSleeping;
});

// Update the sprite based on the given frame count.
function setSprite(name, frame) {
  if (name !== undefined) {
    const sprite = spriteSets[name][frame % spriteSets[name].length];
    nikoEl.style.backgroundPosition = `${sprite[0] * 48}px ${sprite[1] * 64}px`;
  }
}

/* ------------------------------- */
/* ---------- ANIMATION ---------- */
/* ------------------------------- */

function frame() {
  frameCount += 3;
  let diffX = typeof mousePosX !== "undefined" ? nikoPosX - mousePosX : 0;
  let diffY = typeof mousePosY !== "undefined" ? nikoPosY - mousePosY : 0;
  const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

  // Start sleep timer if Niko is near the mouse and not already sleeping.
  if (distance < 128 && !SleepTimer && !isSleeping) {
    SleepTimer = setTimeout(() => {
      isSleeping = true;
      sleepFrameCount = 0;
    }, idleTime);
  }

  // Determine Niko's moving direction based on the relative position to the mouse.
  if (distance > 0) {
    if (diffY / distance > 0.5) direction = dirParam + "N";
    else if (diffY / distance < -0.5) direction = dirParam + "S";
    else if (diffX / distance > 0.5) direction = dirParam + "W";
    else if (diffX / distance < -0.5) direction = dirParam + "E";
  }

  // If Niko is sleeping, update sleep animation and exit.
  if (isSleeping) {
    dirParam = "Sleep";
    setSprite(direction, Math.floor(sleepFrameCount));
    sleepFrameCount += sleepFrameSpeed;
    return;
  }

  // Stop animation if Niko is close to the mouse.
  if (distance < nikoSpeed || distance < 128) {
    setSprite(direction || "idle", 0);
    return;
  }

  // Update the moving sprite.
  dirParam = "";
  setSprite(direction, frameCount);

  // Update Niko's position.
  nikoPosX -= (diffX / distance) * nikoSpeed;
  nikoPosY -= (diffY / distance) * nikoSpeed;
  // Constrain Niko within the window boundaries.
  nikoPosX = Math.min(Math.max(16, nikoPosX), window.innerWidth - 16);
  nikoPosY = Math.min(Math.max(16, nikoPosY), window.innerHeight - 16);

  updateNikoPosition();
}


/* ----------------------------------- */
/* ---------- END ANIMATION ---------- */
/* ----------------------------------- */

// Reset the sleep timer and wake Niko if sleeping.
function resetSleepTimer() {
  clearTimeout(SleepTimer);
  SleepTimer = null;
  if (isSleeping) {
    isSleeping = false;
    sleepFrameCount = 0;
  }
}

// Update Niko's position on screen and notify other parts of the application.
function updateNikoPosition() {
  nikoEl.style.left = `${nikoPosX - 24}px`;
  nikoEl.style.top = `${nikoPosY - 32}px`;
  browser.runtime.sendMessage({
    action: "updateNikoPosition",
    nikoPosX,
    nikoPosY,
    mousePosX,
    mousePosY,
    isSleeping
  });
}

// Handle tab visibility changes.
window.addEventListener("visibilitychange", function() {
  if (!document.hidden) {
    // When the tab becomes active, load the last known position from storage.
    browser.storage.local.get(['nikoPosX', 'nikoPosY', 'mousePosX', 'mousePosY', 'isSleeping']).then((result) => {
      nikoPosX = result.nikoPosX || nikoPosX;
      nikoPosY = result.nikoPosY || nikoPosY;
      mousePosX = result.mousePosX || mousePosX;
      mousePosY = result.mousePosY || mousePosY;
      isSleeping = result.isSleeping || isSleeping;
      // Restart the animation loop.
      resetSleepTimer();
      window.requestAnimationFrame(onAnimationFrame);
    });
  }
});

// Clean up Niko before the window unloads.
window.addEventListener("beforeunload", function() {
  const existingNiko = document.getElementById("oniko");
  if (existingNiko) {
    existingNiko.remove();
  }
});

// Initialize Niko.
init();
