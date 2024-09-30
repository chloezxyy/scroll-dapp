import React, { createContext, useEffect, useState, useContext } from "react";
import { ethers } from "ethers";
import { displayNetworkName } from "@/lib/utils";

export interface AccountType {
  address: string;
  balance: string;
  chainId: string;
  network: string;
}

interface WalletContextType {
  accountData?: AccountType;
  connectToMetaMask: () => Promise<void>;
  disconnectMetamask: () => Promise<void>;
  isConnecting: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [accountData, setAccountData] = useState<AccountType | undefined>();
  const [isConnecting, setIsConnecting] = useState(false);

  const retrieveAccountData = async () => {
    try {
      // chainId is hardcoded as we're interacting with scroll network
      const provider = new ethers.BrowserProvider(window.ethereum);
      // to prompt user to switch to scrollSepolia network
      const signer = await provider.getSigner();

      const address = await signer.getAddress();
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

  /*
   * Gets called in two scenarios:
   * 1. When user clicks on "Connect Wallet" button
   * 2. When user is already connected to MetaMask and page is refreshed
   * */
  const connectToMetaMask = async () => {
    setIsConnecting(true);
    try {
      await autoSwitchToSepoliaNetwork();
      await retrieveAccountData();
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert("MetaMask not installed");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectMetamask = async () => {
    setIsConnecting(true);
    try {
      await window.ethereum.request({
        method: "wallet_revokePermissions",
        params: [
          {
            eth_accounts: {},
          },
        ],
      });
      setAccountData(undefined);
    } catch (e) {
      if (e instanceof Error) {
        alert(`Error disconnecting MetaMask: ${e?.message ?? e}`);
      } else {
        alert("An unknown error occurred");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // function to automatically connect to MetaMask if accounts are already connected
  const connectMetamaskOnMount = async () => {
    if (typeof window !== undefined) {
  };

  // automatically request connection to MetaMask on page load
  useEffect(() => {
    void connectMetamaskOnMount();
  }, []);

  // trigger window reload on metamask network or account change
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
      window.ethereum.on("accountsChanged", () => {
        window.location.reload();
      });
    }
  });

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

// use scrollSepolia network by default
async function autoSwitchToSepoliaNetwork() {
  try {
    // Requests that the wallet switches its active Ethereum chain, scrollSepolia in this case
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x8274f" }],
    });
  } catch {
    // If the wallet does not support chain switching, add the chain
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: "0x8274f", // hexa value of chainId
          chainName: "scrollSepolia",
          rpcUrls: ["https://sepolia-rpc.scroll.io/"],
          iconUrls: [],
          nativeCurrency: {
            name: "ETH",
            symbol: "ETH",
            decimals: 18,
          },
          blockExplorerUrls: ["https://sepolia.scrollscan.com"],
        },
      ],
    });
  }
}
