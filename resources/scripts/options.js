document.addEventListener('DOMContentLoaded', () => {
  // Get the form elements by id
  const optionsForm = document.getElementById('optionsForm');
  const message = document.getElementById('message');
  const nikoSpeedInput = document.getElementById('nikoSpeed');
  const sleepFrameSpeedInput = document.getElementById('sleepFrameSpeed');
  const idleTimeInput = document.getElementById('idleTime');
  const nikoSpeedValue = document.getElementById('nikoSpeedValue');
  const sleepFrameSpeedValue = document.getElementById('sleepFrameSpeedValue');
  const resetButton = document.getElementById('resetButton');
  
  // Default option values
  const defaultOptions = {
    nikoSpeed: 10,
    sleepFrameSpeed: 0.1,
    idleTime: 60000  // 60 seconds
  };

  function updateDisplay() {
    nikoSpeedValue.textContent = nikoSpeedInput.value;
    sleepFrameSpeedValue.textContent = sleepFrameSpeedInput.value;
  }

  // Load current settings
  browser.storage.local.get(["nikoSpeed", "sleepFrameSpeed", "idleTime"]).then(options => {
    nikoSpeedInput.value = options.nikoSpeed || defaultOptions.nikoSpeed;
    sleepFrameSpeedInput.value = options.sleepFrameSpeed || defaultOptions.sleepFrameSpeed;
    idleTimeInput.value = Math.floor((options.idleTime || defaultOptions.idleTime) / 1000);
    updateDisplay();
  });

  // Update displayed slider values
  nikoSpeedInput.addEventListener('input', updateDisplay);
  sleepFrameSpeedInput.addEventListener('input', updateDisplay);

// Reset settings
resetButton.addEventListener('click', () => {
  nikoSpeedInput.value = defaultOptions.nikoSpeed;
  sleepFrameSpeedInput.value = defaultOptions.sleepFrameSpeed;
  idleTimeInput.value = Math.floor(defaultOptions.idleTime / 1000);
  updateDisplay();
  // Save default settings
  browser.storage.local.set(defaultOptions).then(() => {
  }).catch(error => {
    console.error("Error resetting settings:", error);
    message.textContent = "Error resetting settings.";
  });
});

// Save settings
optionsForm.addEventListener('submit', event => {
  event.preventDefault();
  // Parse values
  const options = {
    nikoSpeed: parseInt(nikoSpeedInput.value, 10),
    sleepFrameSpeed: parseFloat(sleepFrameSpeedInput.value),
    idleTime: parseInt(idleTimeInput.value, 10) * 1000
  };
  // Save to local storage
  browser.storage.local.set(options).then(() => {
  }).catch(error => {
    console.error("Error saving settings:", error);
    message.textContent = "Error saving settings.";
    });
  });
});
