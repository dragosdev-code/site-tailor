import { useEffect, useState } from "react";

import { IS_EXTENSION_CONTEXT } from "#/constants";

export function useCurrentTabId(): number | null {
  const [tabId, setTabId] = useState<number | null>(null);

  useEffect(() => {
    if (!IS_EXTENSION_CONTEXT) return;

    // Function to update the tab id
    const updateTabId = () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs.length > 0 && tabs[0].id !== undefined) {
          setTabId(tabs[0].id);
        }
      });
    };

    updateTabId();

    chrome.tabs.onActivated.addListener(updateTabId);
    chrome.tabs.onUpdated.addListener(updateTabId);

    return () => {
      chrome.tabs.onActivated.removeListener(updateTabId);
      chrome.tabs.onUpdated.removeListener(updateTabId);
    };
  }, []);

  return tabId;
}
