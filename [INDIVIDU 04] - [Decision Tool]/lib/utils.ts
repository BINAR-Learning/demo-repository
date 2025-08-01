import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import LZString from "lz-string";
import { Tools } from "./toolsConfig";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getDataByTool = (tool: Tools) => {
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem(tool);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed || {};
    }
  }
  return {};
}

export const createShareUrl = (shareData: any): string => {
  if (typeof window === "undefined") {
    return "";
  }

  const jsonData = JSON.stringify(shareData);
  const compressedData = LZString.compressToEncodedURIComponent(jsonData);
  return `${window.location.origin}${window.location.pathname}?lz=1&data=${compressedData}`;
};

export const loadSharedData = (): any | null => {
  if (typeof window === "undefined") {
    return null; 
  }

  const params = new URLSearchParams(window.location.search);
  const dataParam = params.get("data");
  const isCompressed = params.get("lz") === "1";
  if (dataParam) {
    let jsonString: string | null = isCompressed
      ? LZString.decompressFromEncodedURIComponent(dataParam)
      : decodeURIComponent(dataParam);
    if (jsonString) {
      try {
        return JSON.parse(jsonString);
      } catch (error) {
        console.error("Error parsing shared data:", error);
        return null;
      }
    }
  }
  return null;
};

export const scrollToBottom = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth",
  });
};