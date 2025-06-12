document.addEventListener('DOMContentLoaded', () => {
  /* --------------------------------------- */
  /* ---------- SETTINGS HANDLING ---------- */
  /* --------------------------------------- */

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
    idleTime: 60000,  // 60 seconds
    language: 'en',
    sprite: 'Niko'
  };

  function updateDisplay() {
    nikoSpeedValue.textContent = nikoSpeedInput.value;
    sleepFrameSpeedValue.textContent = sleepFrameSpeedInput.value;
  }

  // Load current settings
  browser.storage.local.get(["nikoSpeed", "sleepFrameSpeed", "idleTime", "language", "sprite"]).then(options => {
    nikoSpeedInput.value = options.nikoSpeed || defaultOptions.nikoSpeed;
    sleepFrameSpeedInput.value = options.sleepFrameSpeed || defaultOptions.sleepFrameSpeed;
    idleTimeInput.value = Math.floor((options.idleTime || defaultOptions.idleTime) / 1000);
    updateDisplay();

    // Set the language from storage if available, otherwise use default ("en")
    const savedLanguage = options.language || 'en';
    document.getElementById("languageSelect").value = savedLanguage;
    setLanguage(savedLanguage);

    // Set the sprite from storage if available, otherwise use default ("Niko")
    const savedSprite = options.sprite || 'Niko';
    document.getElementById("spriteSelect").value = savedSprite;
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
      idleTime: parseInt(idleTimeInput.value, 10) * 1000,
      language: document.getElementById("languageSelect").value,
      sprite: document.getElementById("spriteSelect").value
    };
    // Save to local storage
    browser.storage.local.set(options).then(() => {
      console.log("Settings saved successfully.");
    }).catch(error => {
      console.error("Error saving settings:", error);
      message.textContent = "Error saving settings.";
    });
  });

/* ---------------------------- */
/* ---------- LOCALE ---------- */
/* ---------------------------- */

  // Language translations for page elements
  const translations = {
    en: {
      headerTitle: "Settings",
      nikoSpeedLabel: "Niko speed:",
      sleepFrameSpeedLabel: "Sleep animation speed:",
      idleTimeLabel: "Idle time (seconds):",
      saveButton: "Save",
      resetButton: "Reset to default",
      reloadMsg: "Please reload the page for changes to take effect.",
      spriteLabel: "Choose sprite:",
      spriteNiko: "Niko",
      spriteTWM: "The World Machine",
      languageLabel: "Choose language:"
    },
    ru: {
      headerTitle: "Настройки",
      nikoSpeedLabel: "Скорость Нико:",
      sleepFrameSpeedLabel: "Скорость анимации сна:",
      idleTimeLabel: "Время до засыпания Нико (секунд):",
      saveButton: "Сохранить",
      resetButton: "Сбросить к значеням по умолчанию",
      reloadMsg: "Перезагрузите страницу для применения изменений.",
      spriteLabel: "Выберите спрайт:",
      spriteNiko: "Нико",
      spriteTWM: "Мировая Машина",
      languageLabel: "Выберите язык:"
    }
  };

  // Make sure that the language drop-down immediately applies the language change
  document.getElementById("languageSelect").addEventListener("change", (e) => {
    const selectedLanguage = e.target.value;
    setLanguage(selectedLanguage);
    // Save language to local storage
    browser.storage.local.set({ language: selectedLanguage }).then(() => {
      console.log("Language saved successfully.");
    }).catch(error => {
      console.error("Error saving language:", error);
      message.textContent = "Error saving language.";
      message.textContent = "Error saving language.";
    });
  });
  // Function to change language
  window.setLanguage = function(lang) {
    if (translations[lang]) {
      // Update page title text
      document.getElementById("headerTitle").textContent = translations[lang].headerTitle;
      // Update form labels
      document.getElementById("nikoSpeedLabel").textContent = translations[lang].nikoSpeedLabel;
      document.getElementById("sleepFrameSpeedLabel").textContent = translations[lang].sleepFrameSpeedLabel;
      document.getElementById("idleTimeLabel").textContent = translations[lang].idleTimeLabel;
      // Update button texts
      document.getElementById("saveButton").textContent = translations[lang].saveButton;
      document.getElementById("resetButton").textContent = translations[lang].resetButton;
      // Update reload message
      document.getElementById("reloadMsg").textContent = translations[lang].reloadMsg;
      // Update language dropdown label text
      document.querySelector('label[for="languageSelect"]').textContent = translations[lang].languageLabel;
      // Update sprite dropdown label text
      document.querySelector('label[for="spriteSelect"]').textContent = translations[lang].spriteLabel;
      document.getElementById("spriteSelect").innerHTML = `
        <option value="Niko">${translations[lang].spriteNiko}</option>
        <option value="TWM">${translations[lang].spriteTWM}</option>
      `;
      // Update the lang attribute in the html tag
      document.documentElement.lang = lang;
    } else {
      console.error("Translations for language " + lang + " are not available.");
    }
  };

  // Set default language (e.g., "en")
  setLanguage('en');
});
