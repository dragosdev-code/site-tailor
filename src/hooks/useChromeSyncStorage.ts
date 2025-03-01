import { useState, useEffect, useCallback, useMemo } from "react";

export function useChromeSyncStorage() {
  const [storageData, setStorageData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  const loadStorage = useCallback(() => {
    if (typeof chrome !== "undefined" && chrome.storage?.sync) {
      chrome.storage.sync.get(null, (data) => {
        setStorageData(data);
        setLoading(false);
      });
    } else {
      setStorageData({ error: "chrome.storage.sync not available" });
      setLoading(false);
    }
  }, []);

  const updateStorage = useCallback(
    (newData: Partial<{ [key: string]: unknown }>) => {
      if (typeof chrome !== "undefined" && chrome.storage?.sync) {
        chrome.storage.sync.set(newData, () => {
          loadStorage();
        });
      }
    },
    [loadStorage]
  );

  const clearStorage = useCallback(() => {
    if (typeof chrome !== "undefined" && chrome.storage?.sync) {
      chrome.storage.sync.clear(() => {
        setStorageData({});
      });
    }
  }, []);

  useEffect(() => {
    loadStorage();
  }, [loadStorage]);

  const stringifiedStorageData = useMemo(() => {
    return JSON.stringify(storageData, null, 2);
  }, [storageData]);

  return {
    storageData,
    stringifiedStorageData,
    loading,
    updateStorage,
    clearStorage,
    reload: loadStorage,
  };
}
