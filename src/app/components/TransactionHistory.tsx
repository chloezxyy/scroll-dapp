"use client";

import { useEffect, useState } from "react";
import { TransactionType } from "@/app/components/Form";
import { useWallet } from "@/providers/WalletProvider";

export default function TransactionHistory() {
  const { accountData } = useWallet();
  const { balance } = accountData;
  const [history, setHistory] = useState<TransactionType[]>([]);

  // Fetch transaction history; when account balance changes
  useEffect(() => {
    async function fetchHistory() {
      const response = await fetch("http://localhost:3000/history", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setHistory(data);
    }

    fetchHistory();
  }, [balance]);

  if (!history.length) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 mt-10 text-sm md:text-base">
      <h2 className="text-lg font-bold">Transaction History</h2>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row justify-between">
          <span>#</span>
          <span>Recipient Address</span>
          <span>Amount</span>
          <span>Timestamp</span>
        </div>
        {history.toReversed().map((transaction: TransactionType, index) => (
          <ol
            key={transaction?.id || index}
            className="flex flex-row justify-between w-full text-black"
          >
            <li>{index + 1}.</li>
            <li className="w-[100px] md:w-fit truncate">
              {transaction.recipientAddress}
            </li>
            <li>{transaction.amount}</li>
            <li className="truncate w-[100px] md:w-fit">
              {new Date(transaction.timestamp).toUTCString()}
            </li>
          </ol>
        ))}
      </div>
    </div>
  );
}
