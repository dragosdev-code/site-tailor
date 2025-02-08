import { useCallback } from "react";
import { useCurrentTabId } from "./useCurrentTabId";
import { IS_EXTENSION_CONTEXT } from "../constants";

export function useSendMessageToCurrentTab() {
  const tabId = useCurrentTabId();

  const sendMessage = useCallback(
    (message: unknown) => {
      if (!IS_EXTENSION_CONTEXT) return;
      if (tabId !== null) {
        chrome.tabs.sendMessage(tabId, message);
      } else {
        console.warn("No active tab ID found.");
      }
    },
    [tabId]
  );

  return sendMessage;
}
