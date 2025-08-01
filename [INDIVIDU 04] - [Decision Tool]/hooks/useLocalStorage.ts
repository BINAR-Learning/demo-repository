import { useState, useEffect, useCallback } from "react";
import { Tools } from "@/lib/toolsConfig";

export default function useLocalStorage<T>(tool: Tools, initialValue: T) {
  const STORAGE_KEY = tool;
  
  const [storedValue, setStoredValue] = useState<T>(() => {
    // Only attempt to read from localStorage on the client side
    if (typeof window !== 'undefined') {
      try {
        const item = localStorage.getItem(STORAGE_KEY);
        return item ? JSON.parse(item) : initialValue;
      } catch (error) {
        console.error("Error reading localStorage:", error);
        return initialValue;
      }
    }
    return initialValue;
  });

  // New method to force update state from localStorage
  const updateFromLocalStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const item = localStorage.getItem(STORAGE_KEY);
        if (item) {
          const parsedItem = JSON.parse(item);
          // Ensure we only update if the data is different
          setStoredValue(prevValue => 
            JSON.stringify(prevValue) !== JSON.stringify(parsedItem) 
              ? parsedItem 
              : prevValue
          );
        }
      } catch (error) {
        console.error("Error reading localStorage:", error);
      }
    }
  }, [STORAGE_KEY]);

  // Sync state when localStorage changes (cross-tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const newValue = JSON.parse(e.newValue);
          setStoredValue(newValue);
        } catch (error) {
          console.error("Error parsing storage update:", error);
        }
      }
    };
    // Add listener for storage events
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [STORAGE_KEY]);

  // Update localStorage when storedValue changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storedValue));
      } catch (error) {
        console.error("Error setting localStorage:", error);
      }
    }
  }, [storedValue, STORAGE_KEY]);

  return [storedValue, setStoredValue, updateFromLocalStorage] as const;
}