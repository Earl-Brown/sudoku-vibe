import "@testing-library/jest-dom/vitest";

if (typeof window !== "undefined" && typeof window.localStorage?.clear !== "function") {
  const storage = new Map<string, string>();
  const localStorageMock = {
    getItem(key: string) {
      return storage.has(key) ? storage.get(key)! : null;
    },
    setItem(key: string, value: string) {
      storage.set(key, value);
    },
    removeItem(key: string) {
      storage.delete(key);
    },
    clear() {
      storage.clear();
    }
  };

  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
    configurable: true
  });
}
