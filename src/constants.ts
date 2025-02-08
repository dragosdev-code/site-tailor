/**
 * A constant indicating whether the Chrome extension APIs are available.
 * This will be true when running in the extension context,
 * and false when running in a standard web context (like during npm run dev).
 */
export const IS_EXTENSION_CONTEXT: boolean =
  typeof chrome !== "undefined" && !!chrome.runtime;
