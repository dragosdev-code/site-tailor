import { useState, useEffect } from "react";
import { ClipboardIcon } from "../icons/ClipboardIcon";
import { CheckCirlceIcon } from "../icons/CheckCircleIcon";
import { PencilIcon } from "../icons/PencilIcon";

export function SettingsPage() {
  const [storageData, setStorageData] = useState<unknown>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState("");

  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage?.sync) {
      chrome.storage.sync.get(null, (data) => {
        setStorageData(data);
        setEditedData(JSON.stringify(data, null, 2));
      });
    } else {
      const err = { error: "chrome.storage.sync not available" };
      setStorageData(err);
      setEditedData(JSON.stringify(err, null, 2));
    }
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(storageData, null, 2));
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleReset = () => {
    if (typeof chrome !== "undefined" && chrome.storage?.sync) {
      chrome.storage.sync.clear(() => {
        console.log("Chrome sync storage cleared");
        setStorageData({});
        setEditedData(JSON.stringify({}, null, 2));
      });
    } else {
      console.warn("chrome.storage.sync not available");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    // Revert changes by restoring the last stored storageData
    setEditedData(JSON.stringify(storageData, null, 2));
    setIsEditing(false);
  };

  const handleConfirmEdit = () => {
    try {
      const parsedData = JSON.parse(editedData);
      if (typeof chrome !== "undefined" && chrome.storage?.sync) {
        chrome.storage.sync.set(parsedData, () => {
          console.log("Chrome sync storage updated via edit");
          setStorageData(parsedData);
          setIsEditing(false);
        });
      } else {
        console.warn("chrome.storage.sync not available");
      }
    } catch (e) {
      console.error("Invalid JSON. Edit not saved.", e);
      alert("Invalid JSON. Please fix the syntax.");
    }
  };

  return (
    <div className="mb-4">
      <h2 className="text-2xl font-bold mb-4">Chrome Sync Storage Data</h2>
      <div className="relative group">
        {!isEditing ? (
          <>
            <button
              onClick={handleEdit}
              className="absolute left-2 top-2 opacity-0 btn-circle btn group-hover:opacity-100 transition"
              title="Edit"
            >
              <PencilIcon />
            </button>
            <button
              onClick={handleCopy}
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
              {JSON.stringify(storageData, null, 2)}
            </pre>
            <button onClick={handleReset} className="btn btn-error">
              Reset everything
            </button>
          </>
        ) : (
          <>
            <textarea
              className="bg-gray-800 text-white p-4 rounded-md whitespace-pre-wrap break-all mb-4 w-full"
              value={editedData}
              onChange={(e) => setEditedData(e.target.value)}
              rows={15}
            />
            <div className="flex gap-2">
              <button onClick={handleConfirmEdit} className="btn btn-primary">
                Confirm
              </button>
              <button onClick={handleCancelEdit} className="btn btn-error">
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
