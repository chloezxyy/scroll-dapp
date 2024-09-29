import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Used to truncate wallet addresses
export function truncateMiddleText(str: string, length = 5) {
  return `${str.slice(0, length)}...${str.slice(-length)}`;
}
