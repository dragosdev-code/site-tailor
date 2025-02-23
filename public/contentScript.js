chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getFavicon") {
    const linkElement = document.querySelector("link[rel~='icon']");
    const faviconUrl = linkElement ? linkElement.getAttribute("href") : null;
    // Get the current page domain
    const domain = new URL(document.URL).hostname;
    console.log({ linkElement, faviconUrl, domain });

    if (faviconUrl) {
      fetch(faviconUrl)
        .then((response) => response.blob())
        .then((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result;
            sendResponse({ favIconData: base64data, domain });
          };
          reader.readAsDataURL(blob);
        })
        .catch((error) => {
          console.error("Error fetching favicon", error);
          sendResponse({ favIconData: null, domain });
        });
      // Return true to signal asynchronous response.
      return true;
    } else {
      sendResponse({ favIconData: null, domain });
    }
  }
});

let activePresetRemovalTargets = [];

function removeElementsIfExists() {
  activePresetRemovalTargets.forEach(({ selector, message, multiple }) => {
    if (multiple) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        elements.forEach((el) => el.remove());
        console.log(
          `%c${message} (${elements.length} removed)`,
          "background: yellow; color: black; font-size: 16px; font-weight: bold; padding: 4px 8px; border-radius: 4px;"
        );
      }
    } else {
      const el = document.querySelector(selector);
      if (el) {
        el.remove();
        console.log(
          `%c${message}`,
          "background: yellow; color: black; font-size: 16px; font-weight: bold; padding: 4px 8px; border-radius: 4px;"
        );
      }
    }
  });
}

chrome.storage.sync.get("presets", (data) => {
  if (data.presets) {
    // For example, choose a preset based on current domain or a fixed preset ID.
    // Here we simply choose the first preset.
    const preset = data.presets[0];
    if (preset) {
      activePresetRemovalTargets = preset.removalTargets;
      console.log(
        "Loaded preset removal targets from storage:",
        activePresetRemovalTargets
      );
      removeElementsIfExists();
    }
  } else {
    console.log("No presets found in storage.");
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in content script:", message);
  if (message.type === "updatePresetRemovalTargets") {
    // If the message is for the preset we care about:
    // You might check message.presetId against a stored value.
    activePresetRemovalTargets = message.removalTargets;
    console.log(
      "%cPreset removal targets updated in content script!",
      "background: #4ade80; color: white; font-size: 16px; font-weight: bold; padding: 4px 8px; border-radius: 4px;"
    );
    removeElementsIfExists();
  }
  return true;
});

const observer = new MutationObserver(() => {
  removeElementsIfExists();
});
observer.observe(document.body, { childList: true, subtree: true });

removeElementsIfExists();
