import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { NETWORKS } from "@/constants";
import { ethers } from "ethers";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Used to truncate wallet addresses
export function truncateMiddleText(str: string, length = 5) {
  return `${str.slice(0, length)}...${str.slice(-length)}`;
}

export function displayNetworkName(network: ethers.Network) {
  if (
    network.name === "unknown" &&
    Number(network.chainId) === NETWORKS.scrollSepolia.chainId
  ) {
    return NETWORKS.scrollSepolia.name;
  }
  return network.name;
}
