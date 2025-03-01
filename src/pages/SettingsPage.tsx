import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";

import { useChromeSyncStorage } from "#/hooks/useChromeSyncStorage";
import { useCopyToClipboard } from "#/hooks/useCopyToClipboard";
import { ClipboardIcon } from "#/icons/ClipboardIcon";
import { CheckCirlceIcon } from "#/icons/CheckCircleIcon";
import { PencilIcon } from "#/icons/PencilIcon";

type FormValues = {
  storageJson: string;
};

export function SettingsPage() {
  const { stringifiedStorageData, loading, updateStorage, clearStorage } =
    useChromeSyncStorage();
  const { copy, copySuccess } = useCopyToClipboard();
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { storageJson: stringifiedStorageData },
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    reset({ storageJson: stringifiedStorageData });
    setIsEditing(false);
  };

  const handleConfirmEdit: SubmitHandler<FormValues> = (data) => {
    try {
      const parsedData = JSON.parse(data.storageJson);
      updateStorage(parsedData);
      setIsEditing(false);
    } catch (e) {
      console.error("Invalid JSON. Edit not saved.", e);
      alert("Invalid JSON. Please fix the syntax.");
    }
  };

  return (
    <div className="mb-4">
      <h2 className="text-2xl font-bold mb-4">Chrome Sync Storage Data</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          {!isEditing && (
            <>
              <div className="relative group">
                <button
                  onClick={handleEdit}
                  className="absolute left-2 top-2 opacity-0 btn-circle btn group-hover:opacity-100 transition"
                  title="Edit"
                >
                  <PencilIcon />
                </button>
                <button
                  onClick={() => copy(stringifiedStorageData)}
                  className="absolute right-2 top-2 opacity-0 btn-circle btn group-hover:opacity-100 transition"
                  title={copySuccess ? "Copied!" : "Copy to clipboard"}
                >
                  <label className="swap swap-flip">
                    <input
                      type="checkbox"
                      checked={copySuccess}
                      readOnly
                      className="hidden"
                    />
                    <div className="swap-off">
                      <ClipboardIcon />
                    </div>
                    <div className="swap-on text-green-500">
                      <CheckCirlceIcon />
                    </div>
                  </label>
                </button>
                <pre className="bg-gray-800 text-white p-4 rounded-md whitespace-pre-wrap break-all mb-4">
                  {stringifiedStorageData}
                </pre>
              </div>
              <button
                onClick={clearStorage}
                className="btn btn-error group-hover:opacity-100 transition"
                title="Reset"
              >
                Reset everything
              </button>
            </>
          )}
          {isEditing && (
            <>
              <form onSubmit={handleSubmit(handleConfirmEdit)} className="mb-4">
                <textarea
                  {...register("storageJson", { required: true })}
                  className="bg-gray-800 text-white p-4 rounded-md whitespace-pre-wrap break-all w-full"
                  rows={25}
                />
                <div className="flex gap-2 mt-2">
                  <button type="submit" className="btn btn-primary">
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="btn btn-error"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
