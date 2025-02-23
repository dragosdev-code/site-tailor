import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useLocation } from "wouter";
import { IS_EXTENSION_CONTEXT } from "../constants";
import { useSendMessageToCurrentTab } from "../hooks/useSendMessageToCurrentTab";
import { useCurrentTabId } from "../hooks/useCurrentTabId";

export interface Preset {
  id: string;
  domain: string;
  favicon: string;
  removalTargets: string[]; // adjust if needed
}

interface FormValues {
  presetName: string;
  useFavicon: boolean;
}

export const WebsitesPresets: React.FC = () => {
  const { register, handleSubmit, reset, setValue } = useForm<FormValues>({
    defaultValues: { presetName: "", useFavicon: true },
  });
  const [presets, setPresets] = useState<Preset[]>([]);
  const [, setLocation] = useLocation();
  const sendMessageToCurrentTab = useSendMessageToCurrentTab();
  const currentTabId = useCurrentTabId();

  // Load stored presets on mount.
  useEffect(() => {
    if (IS_EXTENSION_CONTEXT && chrome.storage?.sync) {
      chrome.storage.sync.get("presets", (data: { presets?: Preset[] }) => {
        if (data.presets) {
          setPresets(data.presets);
        }
      });
    }
  }, []);

  // Function to update domain (and favicon data if needed) from active tab.
  const updateDomainFromActiveTab = () => {
    console.log("updateDomainFromActiveTab called");
    if (IS_EXTENSION_CONTEXT) {
      sendMessageToCurrentTab({ type: "getFavicon" }, (response) => {
        if (response && response.domain) {
          console.log("Received response:", response);
          setValue("presetName", response.domain);
        }
      });
    }
  };

  console.log({ currentTabId });

  // Call updateDomainFromActiveTab when the active tab changes.
  useEffect(() => {
    if (currentTabId !== null) {
      updateDomainFromActiveTab();
    }
  }, [currentTabId, updateDomainFromActiveTab]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const { presetName, useFavicon } = data;
    let favicon = "";

    if (IS_EXTENSION_CONTEXT && useFavicon) {
      // Retrieve the favicon data from the active tab.
      favicon = await new Promise<string>((resolve) => {
        sendMessageToCurrentTab({ type: "getFavicon" }, (response) => {
          resolve(
            response && response.favIconData
              ? response.favIconData
              : "/default-favicon.png"
          );
        });
      });
    }

    const newPreset: Preset = {
      id: Date.now().toString(),
      domain: presetName.trim(),
      favicon,
      removalTargets: [],
    };

    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);

    if (IS_EXTENSION_CONTEXT && chrome.storage?.sync) {
      chrome.storage.sync.set({ presets: updatedPresets }, () => {
        console.log("Preset added to storage:", newPreset);
      });
    }
    reset({ presetName: "", useFavicon: true });
  };

  return (
    <div className="flex flex-col items-center text-2xl font-bold gap-10 p-6">
      <h2>Website Presets</h2>

      {/* Display current presets */}
      <div className="flex flex-col gap-4">
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() =>
              setLocation(`/presets/${preset.id}`, { state: { preset } })
            }
            className="flex items-center gap-2 bg-neutral-600 py-2 px-4 rounded-full hover:cursor-pointer hover:bg-neutral-500 transition"
          >
            <img src={preset.favicon} className="h-10" />
            <p className="text-lg">{preset.domain}</p>
          </button>
        ))}
      </div>

      {/* Dropdown for adding a new preset */}
      <div className="dropdown dropdown-center">
        <div
          tabIndex={0}
          role="button"
          onFocus={updateDomainFromActiveTab}
          className="btn m-1"
        >
          + Make Preset for this Website
        </div>
        <ul
          tabIndex={0}
          className="dropdown-content bg-base-100 rounded-box z-10 w-52 p-2 shadow-sm space-y-2"
        >
          <li>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-2 items-center"
            >
              <div className="form-control">
                <label className="label text-sm">
                  <span className="label-text">Preset Name</span>
                </label>
                <input
                  type="text"
                  {...register("presetName", { required: true })}
                  className="input input-bordered"
                />
              </div>
              <div className="form-control flex items-center">
                <label className="cursor-pointer label text-sm">
                  <span className="label-text">Use website's favicon</span>
                  <input
                    type="checkbox"
                    {...register("useFavicon")}
                    className="checkbox checkbox-primary"
                  />
                </label>
              </div>
              <div className="mt-2">
                <button type="submit" className="btn btn-primary w-full">
                  Confirm
                </button>
              </div>
            </form>
          </li>
        </ul>
      </div>
    </div>
  );
};
