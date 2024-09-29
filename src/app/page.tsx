"use client";

import { WalletDetails } from "@/app/components/WalletDetails";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Form from "@/app/components/Form";
import TransactionHistory from "@/app/components/TransactionHistory";
import { displayNetworkName, truncateMiddleText } from "@/lib/utils";

export interface AccountType {
  address?: string;
  balance?: string;
  chainId?: string;
  network?: string;
}

export default function Home() {
  const [accountData, setAccountData] = useState<AccountType>({});
  const [isConnecting, setIsConnecting] = useState(false);

  const ethereum = window.ethereum;
  const provider = new ethers.BrowserProvider(ethereum);

  async function retrieveAccountData() {
    // Request access to the user's MetaMask accounts
    const accounts = await ethereum.request({
      method: "eth_requestAccounts",
    });
    // Get the connected Ethereum address
    const address = accounts[0];
    // Create an ethers.js provider using the injected provider from MetaMask
    // Get the account balance
    const balance = await provider.getBalance(address);
    // Get the network ID from MetaMask
    const network = await provider.getNetwork();

    // Update state with the results
    setAccountData({
      address,
      balance: ethers.formatEther(balance),
      // The chainId property is a bigint, change to a string
      chainId: network.chainId.toString(),
      network: displayNetworkName(network),
    });
  }

  const connectToMetaMask = async () => {
    // Check if MetaMask is installed
    if (typeof ethereum !== "undefined" && ethereum.request) {
      try {
        setIsConnecting(true);
        retrieveAccountData();
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
    <div className="flex justify-center min-h-screen items-center p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)] max-w-5xl mx-auto">
      <main className="grid gap-y-5 w-full">
        <WalletDetails {...accountData} />
        <div className="flex flex-row w-full items-center justify-between">
          <h1 className="text-lg font-bold">Scroll Web dApp</h1>
          {accountData?.address ? (
            <div className="w-[170px]">
              <button
                onClick={() => {
                  // disconnect wallet
                }}
                className="flex flex-row bg-gray-800 hover:bg-gray-600 active:bg-gray-500 p-4 rounded-[10px] gap-x-2"
              >
                <span className=""> 🟢</span>
                <span className="w-[100px] text-white">
                  {truncateMiddleText(accountData?.address) ?? "Wallet Address"}
                </span>
              </button>
            </div>
          ) : (
            <button
              disabled={isConnecting}
              onClick={connectToMetaMask}
              className="bg-gray-800 hover:bg-gray-600 active:bg-gray-500 text-white p-4 rounded-lg w-fit"
            >
              Connect Wallet
            </button>
          )}
        </div>

        <Form {...accountData} />
        <TransactionHistory amount={accountData.balance} />
      </main>
    </div>
  );
}
