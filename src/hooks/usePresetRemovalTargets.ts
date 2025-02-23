import { useState, useEffect } from "react";
import { useSendMessageToCurrentTab } from "./useSendMessageToCurrentTab";
import { IS_EXTENSION_CONTEXT } from "../constants";

export type RemovalTarget = {
  selector: string;
  message: string;
  multiple: boolean;
};

export type Preset = {
  id: string;
  domain: string;
  removalTargets: RemovalTarget[];
};

type UsePresetRemovalTargetsHook = {
  preset: Preset | null;
  addTarget: (target: RemovalTarget) => void;
  removeTarget: (index: number) => void;
};

export function usePresetRemovalTargets(
  presetId: string
): UsePresetRemovalTargetsHook {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [preset, setPreset] = useState<Preset | null>(null);
  const sendMessageToCurrentTab = useSendMessageToCurrentTab();

  // Load presets from storage
  useEffect(() => {
    if (!IS_EXTENSION_CONTEXT) return;
    chrome.storage.sync.get("presets", (data: { presets?: Preset[] }) => {
      if (data.presets) {
        setPresets(data.presets);
        const found = data.presets.find((p) => p.id === presetId) || null;
        setPreset(found);
      }
    });
  }, [presetId]);

  const updatePresetInStorage = (updatedPreset: Preset) => {
    const updatedPresets = presets.map((p) =>
      p.id === presetId ? updatedPreset : p
    );
    setPresets(updatedPresets);
    if (IS_EXTENSION_CONTEXT) {
      chrome.storage.sync.set({ presets: updatedPresets }, () => {
        console.log(
          "%cPreset updated in storage!",
          "background: #4ade80; color: white; font-size: 16px; font-weight: bold; padding: 4px 8px; border-radius: 4px;"
        );
      });
      // Also send a message to content script with the updated targets for this preset.
      sendMessageToCurrentTab({
        type: "updatePresetRemovalTargets",
        presetId,
        removalTargets: updatedPreset.removalTargets,
      });
    }
  };

  const addTarget = (target: RemovalTarget) => {
    if (preset) {
      const updatedPreset = {
        ...preset,
        removalTargets: [...preset.removalTargets, target],
      };
      setPreset(updatedPreset);
      updatePresetInStorage(updatedPreset);
    }
  };

  const removeTarget = (index: number) => {
    if (preset) {
      const updatedPreset = {
        ...preset,
        removalTargets: preset.removalTargets.filter((_, i) => i !== index),
      };
      setPreset(updatedPreset);
      updatePresetInStorage(updatedPreset);
    }
  };

  return {
    preset,
    addTarget,
    removeTarget,
  };
}
