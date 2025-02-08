let removalTargets = [];

function removeElementsIfExists() {
  removalTargets.forEach(({ selector, message, multiple }) => {
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

chrome.storage.sync.get("removalTargets", (data) => {
  if (data.removalTargets) {
    removalTargets = data.removalTargets;
    console.log("Loaded removal targets from storage:", removalTargets);
    removeElementsIfExists();
  } else {
    console.log("No removal targets found in storage.");
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in content script:", message);
  if (message.type === "updateRemovalTargets") {
    removalTargets = message.removalTargets;
    console.log(
      "%cRemoval targets updated in content script!",
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
