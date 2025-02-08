import { useState, useEffect } from "react";
import { useSendMessageToCurrentTab } from "./useSendMessageToCurrentTab";
import { IS_EXTENSION_CONTEXT } from "../constants";

export type RemovalTarget = {
  selector: string;
  message: string;
  multiple: boolean;
};

type UseRemovalTargetsHook = {
  removalTargets: RemovalTarget[];
  addTarget: (target: RemovalTarget) => void;
  removeTarget: (index: number) => void;
};

export function useRemovalTargets(): UseRemovalTargetsHook {
  const [removalTargets, setRemovalTargets] = useState<RemovalTarget[]>([]);
  const sendMessageToCurrentTab = useSendMessageToCurrentTab();

  useEffect(() => {
    if (!IS_EXTENSION_CONTEXT) return;
    chrome.storage.sync.get(
      "removalTargets",
      (data: { removalTargets?: RemovalTarget[] }) => {
        if (data.removalTargets) {
          setRemovalTargets(data.removalTargets);
        }
      }
    );
  }, []);

  const updateExtensionTargets = (targets: RemovalTarget[]): void => {
    if (!IS_EXTENSION_CONTEXT) return;
    chrome.storage.sync.set({ removalTargets: targets }, () => {
      console.log(
        "%cRemoval targets updated in storage!",
        "background: #4ade80; color: white; font-size: 16px; font-weight: bold; padding: 4px 8px; border-radius: 4px;"
      );
    });
    sendMessageToCurrentTab({
      type: "updateRemovalTargets",
      removalTargets: targets,
    });
  };

  const addTarget = (target: RemovalTarget): void => {
    const updatedTargets = [...removalTargets, target];
    setRemovalTargets(updatedTargets);
    updateExtensionTargets(updatedTargets);
  };

  const removeTarget = (index: number): void => {
    const updatedTargets = removalTargets.filter((_, i) => i !== index);
    setRemovalTargets(updatedTargets);
    updateExtensionTargets(updatedTargets);
  };

  return {
    removalTargets,
    addTarget,
    removeTarget,
  };
}
