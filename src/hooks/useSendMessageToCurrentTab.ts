import { useCallback } from "react";

import { useCurrentTabId } from "#/hooks/useCurrentTabId";
import { IS_EXTENSION_CONTEXT } from "#/constants";

export function useSendMessageToCurrentTab() {
  const tabId = useCurrentTabId();

  const sendMessage = useCallback(
    (message: unknown, callback?: (response: any) => void) => {
      if (!IS_EXTENSION_CONTEXT) return;
      if (tabId !== null) {
        chrome.tabs.sendMessage(tabId, message, callback || (() => {}));
      } else {
        console.warn("No active tab ID found.");
      }
    },
    [tabId]
  );

  return sendMessage;
}
