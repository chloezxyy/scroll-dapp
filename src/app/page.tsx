"use client";

import { WalletDetails } from "@/app/components/WalletDetails";
import Form from "@/app/components/Form";
import TransactionHistory from "@/app/components/TransactionHistory";
import { WalletProvider } from "@/providers/WalletProvider";
import { ConnectWalletButton } from "@/app/components/ConnectWalletButton";

export default function Home() {
  return (
    <WalletProvider>
      <div className="p-5">
        <main className="md:max-w-4xl mx-auto grid gap-y-5">
          <WalletDetails />
          <header className="flex flex-row w-full items-center justify-between">
            <h1 className="text-base md:text-lg font-bold">Scroll Web dApp</h1>
            <ConnectWalletButton />
          </header>
          <Form />
          <TransactionHistory />
        </main>
      </div>
    </WalletProvider>
  );
}
