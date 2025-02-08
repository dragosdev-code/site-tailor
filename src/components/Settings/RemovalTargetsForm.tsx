import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  RemovalTarget,
  useRemovalTargets,
} from "../../hooks/useRemovalTargets";

type FormValues = {
  selector: string;
  message: string;
  multiple: boolean;
};

const RemovalTargetsForm: React.FC = () => {
  const { removalTargets, addTarget, removeTarget } = useRemovalTargets();
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
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-3xl font-bold mb-4 text-center">
        Element Hider Settings
      </h2>
      <form onSubmit={handleSubmit(onSubmit)}>
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
      <ul className="flex flex-col mt-4">
        {removalTargets.map((target, index) => (
          <li
            key={index}
            className="flex justify-between items-center py-2 px-4 rounded-box border-b border-base-300 mt-2 bg-base-200"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-300">Selector:</p>
                <p className="text-sm font-semibold text-gray-100">
                  {target.selector}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-300">Message:</p>
                <p className="text-sm text-gray-100">{target.message}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-300">Multiple:</p>
                <p className="text-sm text-gray-100">
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
        ))}
      </ul>
    </div>
  );
};

export default RemovalTargetsForm;
