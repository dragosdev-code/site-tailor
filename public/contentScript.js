let activePresetRemovalTargets = [];
let autoCopyEnabled = false;
let copySelector = ".article-body__content"; // your selector
let originalContentHTML = "";
let overlayEl = null;
let openOverlayButton = null;

// Helper: get the element to copy/replace
function getTargetElement() {
  const el = document.querySelector(copySelector);
  console.log(
    `[DEBUG] getTargetElement() -> selector: "${copySelector}", found:`,
    !!el
  );
  return el;
}

// Remove elements based on current removal targets.
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

function cleanElementAttributes(element) {
  // Create a deep clone so we don't modify the original.
  const clone = element.cloneNode(true);

  function removeAttrs(node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      // If the node is an <img>, keep the "src" attribute and remove all others.
      if (node.tagName.toLowerCase() === "img") {
        Array.from(node.attributes).forEach((attr) => {
          if (attr.name !== "src") {
            node.removeAttribute(attr.name);
          }
        });
      } else {
        // For other elements, remove all attributes.
        while (node.attributes.length > 0) {
          node.removeAttribute(node.attributes[0].name);
        }
      }

      // Check for Pattern 1: Element's first child is a <div> with text "Most Popular".
      if (
        node.firstElementChild &&
        node.firstElementChild.tagName.toLowerCase() === "div" &&
        node.firstElementChild.textContent.trim() === "Most Popular"
      ) {
        if (node.parentNode) {
          console.log("[DEBUG] Removing node containing 'Most Popular':", node);
          node.parentNode.removeChild(node);
          return; // Stop processing this branch.
        }
      }

      // Check for Pattern 2: A <figure> whose first child is a <p> with text "Featured Video".
      if (
        node.tagName.toLowerCase() === "figure" &&
        node.firstElementChild &&
        node.firstElementChild.tagName.toLowerCase() === "p" &&
        node.firstElementChild.textContent.trim() === "Featured Video"
      ) {
        if (node.parentNode) {
          console.log("[DEBUG] Removing <figure> with 'Featured Video':", node);
          node.parentNode.removeChild(node);
          return; // Stop processing this branch.
        }
      }

      // Check for Pattern 3: A node that contains an SVG with a <title> of "Save this story".
      const svgTitleElement = node.querySelector("svg > title");
      if (
        svgTitleElement &&
        svgTitleElement.textContent.trim() === "Save this story"
      ) {
        if (node.parentNode) {
          console.log("[DEBUG] Removing node with 'Save this story':", node);
          node.parentNode.removeChild(node);
          return; // Stop processing this branch.
        }
      }

      // Recursively process child nodes.
      Array.from(node.children).forEach((child) => removeAttrs(child));
    }
  }

  removeAttrs(clone);
  return clone;
}

// Capture the original content after a 500ms delay.
// Uses a deep clone and cleans attributes.
function captureOriginalContent() {
  setTimeout(() => {
    const targetEl = getTargetElement();
    if (!targetEl) {
      console.warn("[DEBUG] No element found for selector:", copySelector);
      return;
    }
    const cleanClone = cleanElementAttributes(targetEl);
    originalContentHTML = cleanClone.innerHTML;
    console.log(
      "[DEBUG] Captured originalContentHTML length:",
      originalContentHTML.length
    );
    console.log(
      "[DEBUG] Captured original TEXT (first 100 chars):",
      cleanClone.innerText.slice(0, 100)
    );
  }, 500);
}

// Create the overlay (only when user clicks the button)
function showOverlay() {
  if (overlayEl) {
    overlayEl.remove();
    overlayEl = null;
  }

  if (!originalContentHTML) {
    console.log("[DEBUG] No originalContentHTML stored, skipping overlay.");
    return;
  }

  // Create the overlay container.
  overlayEl = document.createElement("div");
  overlayEl.style.position = "fixed";
  overlayEl.style.top = "50%";
  overlayEl.style.left = "50%";
  overlayEl.style.transform = "translate(-50%, -50%)";
  overlayEl.style.width = "90%";
  overlayEl.style.maxWidth = "800px";
  overlayEl.style.maxHeight = "90vh";
  // Allow the close button to overflow outside the modal.
  overlayEl.style.overflow = "visible";
  overlayEl.style.background = "rgba(229, 229, 255, 0.96)"; // semi-transparent highlight
  overlayEl.style.color = "dark";
  overlayEl.style.zIndex = "999999";
  overlayEl.style.boxSizing = "border-box";
  overlayEl.style.borderRadius = "8px";
  overlayEl.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";

  // Create a content container that is scrollable and limits text width.
  const contentContainer = document.createElement("div");
  contentContainer.style.maxHeight = "90vh";
  contentContainer.style.overflow = "auto";
  contentContainer.style.padding = "2rem";
  // Limit text width (simulate the website's max width)
  contentContainer.style.margin = "0 auto";
  contentContainer.innerHTML = originalContentHTML;
  overlayEl.appendChild(contentContainer);

  // Create the close button positioned outside the top-right corner.
  const closeBtn = document.createElement("button");
  closeBtn.innerText = "✕";
  closeBtn.style.width = "50px";
  closeBtn.style.height = "50px";
  closeBtn.style.position = "absolute";
  closeBtn.style.top = "-20px";
  closeBtn.style.right = "-20px";
  closeBtn.style.background = "rgb(97, 93, 255)";
  closeBtn.style.color = "white";
  closeBtn.style.padding = "0.5rem";
  closeBtn.style.border = "none";
  closeBtn.style.borderRadius = "50%";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.fontSize = "1.5rem";
  closeBtn.addEventListener("click", () => {
    overlayEl.remove();
    overlayEl = null;
  });
  overlayEl.appendChild(closeBtn);

  document.body.appendChild(overlayEl);
  console.log("[DEBUG] Overlay shown.");
}

function createOpenOverlayButton() {
  if (openOverlayButton) return;

  // Inject keyframes for the float animation if not already present.
  if (!document.getElementById("float-animation-style")) {
    const style = document.createElement("style");
    style.id = "float-animation-style";
    style.textContent = `
      @keyframes float {
        0% { transform: translate(-50%, 0); }
        50% { transform: translate(-50%, -10px); }
        100% { transform: translate(-50%, 0); }
      }
    `;
    document.head.appendChild(style);
  }

  openOverlayButton = document.createElement("button");
  openOverlayButton.innerText = "Show Original Text";
  openOverlayButton.style.position = "fixed";
  openOverlayButton.style.bottom = "20px";
  openOverlayButton.style.left = "50%";
  // The keyframes use translate(-50%, y) so we don't add extra translateX here.
  openOverlayButton.style.transform = "translate(-50%, 0)";
  openOverlayButton.style.zIndex = "999999";
  openOverlayButton.style.background = "blue";
  openOverlayButton.style.color = "white";
  openOverlayButton.style.padding = "0.5rem 1rem";
  openOverlayButton.style.borderRadius = "5px";
  openOverlayButton.style.border = "none";
  openOverlayButton.style.cursor = "pointer";
  // Add a continuous floating animation.
  openOverlayButton.style.animation = "float 3s ease-in-out infinite";

  openOverlayButton.addEventListener("click", () => {
    console.log("[DEBUG] Manual overlay button clicked -> showOverlay()");
    showOverlay();
  });

  document.body.appendChild(openOverlayButton);
}

// Listen for messages from the side panel.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[DEBUG] Message received:", message);
  if (message.type === "updatePresetRemovalTargets") {
    activePresetRemovalTargets = message.removalTargets;
    if (message.copySelector) {
      copySelector = message.copySelector;
    }
    if (typeof message.autoCopy === "boolean") {
      autoCopyEnabled = message.autoCopy;
      // Only capture and enable overlay if current domain matches the preset.
      const currentDomain = new URL(document.URL).hostname;
      if (message.presetDomain && currentDomain === message.presetDomain) {
        if (autoCopyEnabled) {
          console.log(
            "[DEBUG] autoCopy enabled and domain matches preset -> capturing original content with delay"
          );
          captureOriginalContent();
        } else {
          console.log("[DEBUG] autoCopy disabled.");
        }
      } else {
        console.log(
          `[DEBUG] Current domain (${currentDomain}) does not match preset domain (${message.presetDomain}). Skipping overlay logic.`
        );
      }
    }
    console.log("[DEBUG] Preset removal targets updated.");
    removeElementsIfExists();
  }
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
  return true;
});

// On startup, load preset data.
chrome.storage.sync.get("presets", (data) => {
  if (data.presets) {
    try {
      const currentDomain = new URL(document.URL).hostname;
      const preset = data.presets.find((p) => p.domain === currentDomain);
      if (preset) {
        activePresetRemovalTargets = preset.removalTargets;
        if (preset.copySelector) {
          copySelector = preset.copySelector;
        }
        if (preset.autoCopy) {
          autoCopyEnabled = true;
          captureOriginalContent();
        }
        console.log(
          "[DEBUG] Loaded preset removal targets:",
          activePresetRemovalTargets
        );
        removeElementsIfExists();
        // Only create the overlay button if the current domain matches the preset.
        createOpenOverlayButton();
      } else {
        console.log(
          "[DEBUG] No preset found for current domain:",
          currentDomain
        );
      }
    } catch (e) {
      console.error("[DEBUG] Failed to parse current URL:", e);
    }
  } else {
    console.log("[DEBUG] No presets found in storage.");
  }
});

// Optional: Observe DOM changes to reapply removal targets.
const removalObserver = new MutationObserver(() => {
  removeElementsIfExists();
});
removalObserver.observe(document.body, { childList: true, subtree: true });

// Initial removal check.
removeElementsIfExists();
