# oNiko Add-on

The oNiko extension is designed for browsers based on Chromium and Firefox.

Previously based on [this GitHub repository](https://github.com/adryd325/oneko.js).

---

>[!WARNING]
> 
> The version for Chromium is outdated, and it's support has been frozen. \
If you want to help, you can make a PR to update it. \
There will be no support from me (at least for now).

# Installation:
* **Installation on Firefox:**
   > Download this extension from the [Mozilla Add-ons Marketplace](https://addons.mozilla.org/en-US/firefox/addon/oniko/).

* **Installation on Chromium:**
  > 1\. Change branch to "chromium" \
  > 2\. Download the repository ZIP file and extract it to a convenient location on your computer. Alternatively, you can clone the repository to receive updates. \
  > 3\. Open Chrome and navigate to the extensions page by typing `chrome://extensions/` in the address bar. \
  > 4\. Enable Developer Mode: In the top right corner of the page, toggle the "Developer Mode" switch to turn it on. \
  > 5\. Load the unpacked extension: Click on the "Load unpacked" button and select the folder where you extracted your add-on. \
  > 6\. The extension will be installed: After this, your extension will appear in the list of installed extensions.

* **Installation on Internet Explorer:**
  > Not supported.

---

# Build (Firefox only):
> 1. Install node.js from https://nodejs.org/en/download.
> 2. Clone repository and execute `npm install` to install dependencies.
> 3. Run `npm run build`. Once finished, `dist` directory should be created. \
> \* To enable watch mode execute `npm run watch`.
> 4. Go to [firefox extensions debug page](about:debugging#/runtime/this-firefox), click `Load Temporary Add-on` and select manifest file from `dist` directory.
> 5. Plugin should be now available from plugins page.