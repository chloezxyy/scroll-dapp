"use client";

import { WalletDetails } from "@/app/components/WalletDetails";
import Form from "@/app/components/Form";
import TransactionHistory from "@/app/components/TransactionHistory";
import { WalletProvider } from "@/providers/WalletContextProvider";
import { ConnectWalletButton } from "@/app/components/ConnectWalletButton";

export default function Home() {
  return (
    <WalletProvider>
      <div className="flex justify-center min-h-screen items-center p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)] max-w-5xl mx-auto">
        <main className="grid gap-y-5 w-full">
          <WalletDetails />
          <div className="flex flex-row w-full items-center justify-between">
            <h1 className="text-lg font-bold">Scroll Web dApp</h1>
            <ConnectWalletButton />
          </div>
          <Form />
          <TransactionHistory />
        </main>
      </div>
    </WalletProvider>
  );
}
