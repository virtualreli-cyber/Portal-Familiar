import { useEffect, useRef, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) {
        return JSON.parse(stored) as T;
      }
    } catch (error) {
      console.warn(`No se pudo leer "${key}" de localStorage`, error);
    }
    return initialValue;
  });

  const isFirstRun = useRef(true);

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`No se pudo guardar "${key}" en localStorage`, error);
    }
  }, [key, value]);

  useEffect(() => {
    isFirstRun.current = false;
  }, []);

  return [value, setValue] as const;
}
