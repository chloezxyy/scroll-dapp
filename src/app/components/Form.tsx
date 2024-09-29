"use client";

import { parseEther, ethers, isAddress } from "ethers";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { ConfirmedDialog } from "@/app/components/Dialog";
import { AccountType } from "@/app/page";

export interface TransactionType {
  recipientAddress: string;
  amount: string;
  timestamp: string;
  id?: number;
}

export default function Form(accountData: AccountType) {
  const { balance } = accountData;

  const isConnected = Object.keys(accountData).length !== 0;

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
  const submitForm = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
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
        console.log({ txReceipt });

        const confirmed = (await txReceipt.wait()) as ethers.TransactionReceipt; // Resolves to the TransactionReceipt once the transaction has been included in the chain for confirms blocks

        setTxHash(confirmed.status === 1 ? confirmed.hash : null);
        setTransactionData({
          recipientAddress: address,
          amount: value,
          timestamp: new Date().toISOString(),
          // timestamp: txReceipt.timestamp.toString(),
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
    },
    [formValues],
  );

  // Validate form values
  useEffect(() => {
    // validate address
    if (!isAddress(formValues.address) && formValues.address !== "") {
      setAddressError("Invalid address");
    } else {
      setAddressError("");
    }

    // validate amount
    if (parseFloat(formValues.value) > parseFloat(balance || "0")) {
      setAmountError("Insufficient balance");
    } else if (isNaN(Number(formValues.value))) {
      // check if user input is not a number
      setAmountError("Please enter a valid amount");
    } else {
      setAmountError("");
    }
  }, [formValues, balance]);

  // call /history endpoint to save transaction data
  useEffect(() => {
    if (txHash) {
      fetch("http://localhost:3000/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionData,
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
    <section>
      <form onSubmit={submitForm} className="relative grid gap-y-3 mt-10">
        <div>
          {/*  Transfer Amount */}
          <div className="flex flex-row justify-between">
            <span>How much do you want to transfer?</span>
            <span>Available: {parseFloat(balance || "0").toFixed(5)} ETH</span>
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
