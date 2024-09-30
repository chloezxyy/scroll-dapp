"use client";

import { parseEther, ethers, isAddress } from "ethers";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { ConfirmedDialog } from "@/components/Dialog";
import { useWallet } from "@/providers/WalletProvider";

export interface TransactionType {
  recipientAddress: string;
  amount: string;
  timestamp: string;
  id?: number;
}

export default function Form() {
  const { accountData } = useWallet();

  const isConnected = accountData !== undefined;

  const [formValues, setFormValues] = useState({
    address: "",
    value: "",
  });
  const [amountError, setAmountError] = useState("");
  const [addressError, setAddressError] = useState("");

  const [transactionData, setTransactionData] =
    useState<TransactionType | null>(null);

  // to display confirmation dialog when transaction is successful
  const [txHash, setTxHash] = useState<string | null>(null);

  // to display loading spinner when sending transaction
  const [isPending, setIsPending] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  // function to trigger when user press send
  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsPending(true);
      const ethereum = window.ethereum;
      // Request account access if needed
      await ethereum.enable();

      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();

      // form values
      const address = formValues.address as `0x${string}`;
      const value = formValues.value;

      // Calculate amount to transfer in wei
      const weiAmountValue = parseEther(value);

      // Form the transaction request for sending ETH
      const transactionRequest = {
        to: address,
        value: weiAmountValue.toString(),
      };

      // Send the transaction and log the receipt
      const txReceipt = (await signer.sendTransaction(
        transactionRequest,
      )) as ethers.TransactionResponse;

      const confirmed = (await txReceipt.wait()) as ethers.TransactionReceipt; // Resolves to the TransactionReceipt once the transaction has been included in the chain for confirms blocks
      const blockNumber = confirmed.blockNumber;
      const block = await provider.getBlock(blockNumber);

      setTxHash(confirmed.status === 1 ? confirmed.hash : null);
      setTransactionData({
        recipientAddress: address,
        amount: value,
        timestamp: new Date((block?.timestamp || 1) * 1000).toISOString(),
        // timestamp: new Date().toISOString(),
      } as TransactionType);
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(`Error connecting to MetaMask: ${error?.message ?? error}`);
      } else {
        alert("An unknown error occurred");
      }
    } finally {
      setIsPending(false);
      setFormValues({
        address: "",
        value: "",
      });
    }
  };

  // Validate form values
  useEffect(() => {
    // validate address
    if (!isAddress(formValues.address) && formValues.address !== "") {
      setAddressError("Invalid address");
    } else {
      setAddressError("");
    }

    // validate amount
    if (
      parseFloat(formValues.value) > parseFloat(accountData?.balance || "0")
    ) {
      setAmountError("Insufficient balance");
    } else if (isNaN(Number(formValues.value))) {
      // check if user input is not a number
      setAmountError("Please enter a valid amount");
    } else {
      setAmountError("");
    }
  }, [formValues, accountData?.balance]);

  // call /history endpoint to save transaction data
  useEffect(() => {
    if (txHash) {
      fetch("/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientAddress: transactionData?.recipientAddress,
          amount: transactionData?.amount,
          timestamp: transactionData?.timestamp,
        }),
      })
        .then((res) => {
          console.log({ res });
          console.log("Transaction saved into DB successfully");
        })
        .catch((e) => {
          console.log("Error while calling /history endpoint", e);
        });
    }
  }, [txHash]);

  return (
    <section className="w-full text-sm md:text-base flex-shrink">
      <form onSubmit={submitForm} className="grid gap-y-3 mt-3 w-full">
        <div>
          {/*  Transfer Amount */}
          <div className="flex md:flex-row justify-between w-full">
            <span className="flex-1">How much do you want to transfer?</span>
            <div className="flex flex-2 justify-end">
              <span className="truncate">
                Available: {parseFloat(accountData?.balance || "0").toFixed(5)}{" "}
                ETH
              </span>
            </div>
          </div>

          <Input name="value" placeholder="Amount" onChange={handleChange} />
          {amountError && <p className="text-red-500">{amountError}</p>}
        </div>
        {/*  Receiving Address */}
        <div className="flex flex-col">
          <span>Receiving address</span>
          <Input
            name="address"
            placeholder="Enter address to receive ETH"
            onChange={handleChange}
          />
          {addressError && <p className="text-red-500">{addressError}</p>}
        </div>

        <Button
          disabled={
            !isConnected ||
            isPending ||
            addressError !== "" ||
            amountError !== "" ||
            formValues.address === "" ||
            formValues.value === ""
          }
          type="submit"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send
        </Button>
      </form>

      {/* Confirmation Dialog */}
      {!isPending && txHash && <ConfirmedDialog txHash={txHash} />}
    </section>
  );
}
