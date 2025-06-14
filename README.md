# oNiko Add-on

The oNiko extension is designed for browsers based on Chromium and Firefox.

Previously based on [this GitHub repository](https://github.com/adryd325/oneko.js).

---

# Installation:
* **Installation on Firefox:**
   > Download this extension from the [Mozilla Add-ons Marketplace](https://addons.mozilla.org/en-US/firefox/addon/oniko/).

* **Installation on Chromium:**
  > Manual build required. Follow `Build` instructions.

* **Installation on Internet Explorer and other:**
  > Not tested. May work if built manually.

---

# Build:
> 1. Install node.js from https://nodejs.org/en/download.
> 2. Clone repository and execute `npm install` to install dependencies.
> 3. Run `npm run build-firefox` or `npm run build-chromium`. Once finished, `dist` directory should be created. \
> \* To enable watch mode execute `npm run watch-firefox` or `npm run watch-chromium`.
> 4. Go to [firefox extensions debug page](about:debugging#/runtime/this-firefox) or [chrome extensions debug page](chrome://extensions/) (and enable developer mode), click `Load Temporary Add-on` or `Load Unpacked Extension`(chromium) and select manifest file/folder from `dist` directory.
> 5. Plugin should be now available from plugins page.