import React, {
  createContext,
  useEffect,
  useState,
  useCallback,
  useContext,
  useMemo,
} from "react";
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

  const ethereum = window.ethereum;
  const provider = useMemo(
    () => new ethers.BrowserProvider(ethereum),
    [ethereum],
  );

  const retrieveAccountData = useCallback(async () => {
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    const address = accounts[0];
    const balance = await provider.getBalance(address);
    const network = await provider.getNetwork();

    setAccountData({
      address,
      balance: ethers.formatEther(balance),
      chainId: network.chainId.toString(),
      network: displayNetworkName(network),
    });
  }, [ethereum, provider]);

  const connectToMetaMask = async () => {
    // Check if MetaMask is installed
    if (typeof ethereum !== "undefined" && ethereum.request) {
      try {
        setIsConnecting(true);
        await retrieveAccountData();
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
    if (typeof ethereum !== "undefined" && ethereum.request) {
      // await ethereum.request({
      //   method: "wallet_requestPermissions",
      //   params: [{ eth_accounts: {} }],
      // });
      setAccountData({});
      if (ethereum) {
        console.log("trigger disconnect");
        ethereum.on("disconnect", () => {
          window.location.reload();
        });
      }
    }
  };

  // automatically request connection to MetaMask on page load
  useEffect(() => {
    // trigger window reload on metamask network or account change
    if (ethereum) {
      ethereum.on("chainChanged", () => {
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
