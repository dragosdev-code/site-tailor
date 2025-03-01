import { useState, useCallback } from "react";

export function useCopyToClipboard() {
  const [copySuccess, setCopySuccess] = useState(false);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      return true;
    } catch (err) {
      console.error("Failed to copy:", err);
      setCopySuccess(false);
      return false;
    }
  }, []);

  return { copy, copySuccess };
}
