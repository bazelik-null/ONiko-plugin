﻿/* -------------------------- */
/* ---------- SYNC ---------- */
/* -------------------------- */

let browser = require("webextension-polyfill");

browser.runtime.onMessage.addListener((request) => {
    if (request.action === "updateNikoPosition") {
        // Update Niko's position in local storage
        const { nikoPosX, nikoPosY, mousePosX, mousePosY, isSleeping } = request;

        // Update local storage and send update to all tabs
        browser.storage.local.set({ nikoPosX, nikoPosY, mousePosX, mousePosY, isSleeping })
    }
});