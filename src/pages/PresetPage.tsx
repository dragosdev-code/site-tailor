import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  usePresetRemovalTargets,
  RemovalTarget,
} from "../hooks/usePresetRemovalTargets";
import { ExclamationCircleIcon } from "../icons/ExclamationCirlceIcon";
import { useSendMessageToCurrentTab } from "../hooks/useSendMessageToCurrentTab";

type FormValues = {
  selector: string;
  message: string;
  multiple: boolean;
};

export const PresetPage = () => {
  const locationState = window.history.state;
  const presetState = locationState?.preset;
  const { preset, addTarget, removeTarget } = usePresetRemovalTargets(
    presetState.id
  );
  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      selector: "",
      message: "",
      multiple: false,
    },
  });

  // Local state for the auto-copy toggle.
  const [autoCopy, setAutoCopy] = useState<boolean>(
    presetState?.autoCopy || false
  );
  // Local state for the custom DOM selector.
  const [copySelector, setCopySelector] = useState<string>("body");
  const sendMessageToCurrentTab = useSendMessageToCurrentTab();

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const newTarget: RemovalTarget = {
      selector: data.selector.trim(),
      message: data.message.trim(),
      multiple: data.multiple,
    };

    if (!newTarget.selector || !newTarget.message) return;

    addTarget(newTarget);
    reset();
  };

  // Handler for when the auto-copy toggle changes.
  const handleAutoCopyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAutoCopy = e.target.checked;
    setAutoCopy(newAutoCopy);

    if (presetState && presetState.id) {
      // Update the preset in chrome storage with the new autoCopy value.
      chrome.storage.sync.get("presets", (data: { presets?: any[] }) => {
        if (data.presets) {
          const updatedPreset = {
            ...presetState,
            autoCopy: newAutoCopy,
          };
          const updatedPresets = data.presets.map((p) =>
            p.id === presetState.id ? updatedPreset : p
          );
          chrome.storage.sync.set({ presets: updatedPresets }, () => {
            console.log("Preset autoCopy updated", updatedPreset);
          });
          // Send a message to the content script with the updated autoCopy setting and custom selector.
          sendMessageToCurrentTab({
            type: "updatePresetRemovalTargets",
            presetId: presetState.id,
            removalTargets: presetState.removalTargets,
            autoCopy: newAutoCopy,
            copySelector: copySelector, // send the custom selector
          });
        }
      });
    }
  };

  return (
    <div className="">
      <h2 className="text-3xl font-bold mb-4">
        {preset ? `Preset for ${preset.domain}` : "Loading preset..."}
      </h2>
      <div className="tabs tabs-border">
        {/* Tab for removing stuff */}
        <input
          type="radio"
          name="my_tabs_2"
          className="tab"
          aria-label="Remove stuff"
        />
        <div className="tab-content border-base-300 py-5">
          {preset ? (
            <>
              <form onSubmit={handleSubmit(onSubmit)} className="mb-6">
                <input
                  type="text"
                  placeholder="Enter CSS selector"
                  {...register("selector", { required: true })}
                  className="input input-bordered mb-2 w-full"
                />
                <input
                  type="text"
                  placeholder="Enter removal message"
                  {...register("message", { required: true })}
                  className="input input-bordered mb-2 w-full"
                />
                <label className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    {...register("multiple")}
                    className="checkbox checkbox-primary"
                  />
                  <span className="ml-2">Multiple elements?</span>
                </label>
                <button type="submit" className="btn btn-primary w-full">
                  Add Target
                </button>
              </form>

              <ul className="flex flex-col gap-2">
                {preset.removalTargets?.length > 0 ? (
                  preset.removalTargets.map((target, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center py-2 px-4 rounded-box border-b border-base-300 bg-base-200"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">Selector:</p>
                          <p className="text-sm font-semibold">
                            {target.selector}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">Message:</p>
                          <p className="text-sm">{target.message}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">Multiple:</p>
                          <p className="text-sm">
                            {target.multiple ? "Yes" : "No"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeTarget(index)}
                        className="btn btn-sm btn-error"
                      >
                        Remove
                      </button>
                    </li>
                  ))
                ) : (
                  <p>No targets yet</p>
                )}
              </ul>
            </>
          ) : (
            <p>Preset not found.</p>
          )}
        </div>

        {/* Tab for copying and replacing DOM */}
        <input
          type="radio"
          name="my_tabs_2"
          className="tab"
          aria-label="Copy and replace stuff"
          defaultChecked
        />
        <div className="tab-content border-base-300 py-5">
          <div className="form-control mb-4">
            <label className="cursor-pointer label">
              <span className="label-text">Enable Auto-Copy & Replace DOM</span>
              <input
                type="checkbox"
                checked={autoCopy}
                onChange={handleAutoCopyChange}
                className="toggle toggle-primary"
              />
            </label>
          </div>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Custom DOM Selector</span>
            </label>
            <input
              type="text"
              value={copySelector}
              onChange={(e) => setCopySelector(e.target.value)}
              placeholder="e.g. #main-content"
              className="input input-bordered"
            />
          </div>
          <div className="alert alert-info items-start mt-3">
            <ExclamationCircleIcon />
            <span>
              When enabled, the extension will monitor the specified element for
              changes and replace its content with a copy taken at the time of
              preset creation. This helps keep your preset up-to-date if the
              page content changes.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
