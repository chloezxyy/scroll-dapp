import React, { createContext, useEffect, useState, useContext } from "react";
import { ethers } from "ethers";
import { displayNetworkName } from "@/lib/utils";

export interface AccountType {
  address?: string;
  balance?: string;
  chainId?: string;
  network?: string;
}

interface WalletContextType {
  accountData: AccountType;
  connectToMetaMask: () => Promise<void>;
  disconnectMetamask: () => Promise<void>;
  isConnecting: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [accountData, setAccountData] = useState<AccountType>({});
  const [isConnecting, setIsConnecting] = useState(false);

  const retrieveAccountData = async (
    ethereum: Window["ethereum"],
    provider: ethers.BrowserProvider,
  ) => {
    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      const address = accounts[0];
      const balance = await provider.getBalance(address);
      const network = await provider.getNetwork();

      setAccountData({
        address,
        balance: ethers.formatEther(balance),
        chainId: network.chainId.toString(),
        network: displayNetworkName(network),
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(`Error connecting to MetaMask: ${error?.message ?? error}`);
      } else {
        alert("An unknown error occurred");
      }
    }
  };

  const connectToMetaMask = async () => {
    const ethereum = window.ethereum as Window["ethereum"];
    const provider = new ethers.BrowserProvider(ethereum);
    // Check if MetaMask is installed
    if (typeof ethereum !== "undefined" && ethereum.request) {
      try {
        setIsConnecting(true);
        await retrieveAccountData(ethereum, provider);
      } catch (error: unknown) {
        if (error instanceof Error) {
          alert(`Error connecting to MetaMask: ${error?.message ?? error}`);
        } else {
          alert("An unknown error occurred");
        }
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert("MetaMask not installed");
    }
  };

  const disconnectMetamask = async () => {
    const ethereum = window.ethereum;
    if (typeof ethereum !== "undefined" && ethereum.request) {
      setAccountData({});
      if (typeof window !== "undefined" && ethereum) {
        console.log("trigger disconnect");
        ethereum.on("disconnect", () => {
          window.location.reload();
        });
      }
    }
  };

  // automatically request connection to MetaMask on page load
  useEffect(() => {
    const ethereum = window.ethereum;
    // trigger window reload on metamask network or account change
    if (ethereum) {
      ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{
        accountData,
        isConnecting,
        connectToMetaMask,
        disconnectMetamask,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
