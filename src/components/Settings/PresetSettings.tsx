import { useForm, SubmitHandler } from "react-hook-form";
import {
  usePresetRemovalTargets,
  RemovalTarget,
} from "../../hooks/usePresetRemovalTargets";

type FormValues = {
  selector: string;
  message: string;
  multiple: boolean;
};

export const PresetSettings = () => {
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

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-4">
        {preset ? `Preset for ${preset.domain}` : "Loading preset..."}
      </h2>
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
                      <p className="text-sm font-semibold">{target.selector}</p>
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
  );
};
