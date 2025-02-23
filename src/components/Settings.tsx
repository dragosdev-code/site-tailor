import { useState, useEffect } from "react";
import { ClipboardIcon } from "../icons/ClipboardIcon";
import { CheckCirlceIcon } from "../icons/CheckCircleIcon";

export function SettingsPage() {
  const [storageData, setStorageData] = useState<unknown>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage?.sync) {
      chrome.storage.sync.get(null, (data) => {
        setStorageData(data);
      });
    } else {
      setStorageData({ error: "chrome.storage.sync not available" });
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
      });
    } else {
      console.warn("chrome.storage.sync not available");
    }
  };

  return (
    <div className="mb-4">
      <h2 className="text-2xl font-bold mb-4">Chrome Sync Storage Data</h2>
      <div className="relative group">
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
          Reset
        </button>
      </div>
    </div>
  );
}
