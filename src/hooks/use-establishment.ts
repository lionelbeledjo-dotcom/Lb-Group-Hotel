import { useState, useEffect } from "react";

const STORAGE_KEY = "lb-current-establishment";

export function useEstablishment() {
  const [currentId, setCurrentId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEY);
  });

  useEffect(() => {
    if (currentId) {
      localStorage.setItem(STORAGE_KEY, currentId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [currentId]);

  return { currentId, setCurrentId };
}
