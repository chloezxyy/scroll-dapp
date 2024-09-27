"use client";

import { parseEther, ethers, isAddress } from "ethers";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";

import { ConfirmedDialog } from "@/app/components/Dialog";
import { AccountType } from "@/app/page";

// TODO @chloe call api, save data using TransactionResponse's timestamp and recepient address and amount sent

export default function Form({ balance }: AccountType) {
  const [formValues, setFormValues] = useState({
    address: "",
    value: "",
  });
  const [amountError, setAmountError] = useState("");
  const [addressError, setAddressError] = useState("");

  // const [txConfirmed, setTxConfirmed] =
  //   useState<ethers.TransactionReceipt | null>();
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  console.log({ isPending });

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
    } else {
      setAmountError("");
    }
  }, [formValues, balance]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  // function to trigger when user press send
  const submitForm = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      console.log("click");
      console.log({ formValues });
      e.preventDefault();
      try {
        setIsPending(true);
        console.log("inside try");
        const ethereum = window.ethereum;
        // Request account access if needed
        await ethereum.enable();

        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();

        // form values
        const address = formValues.address as `0x${string}`;
        const value = formValues.value;

        // Calculate amount to transfer in wei
        const weiAmountValue = parseEther(value); // parseInt(ETHAmountValue) * 10**18

        // Form the transaction request for sending ETH
        const transactionRequest = {
          to: address,
          value: weiAmountValue.toString(),
        };

        // Send the transaction and log the receipt
        const txReceipt = await signer.sendTransaction(transactionRequest);
        const confirmed = (await txReceipt.wait()) as ethers.TransactionReceipt;

        setTxHash(confirmed.status === 1 ? confirmed.hash : null);
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

      {/*/!* Spinner *!/*/}
      {/*{isPending && <LoadingSpinner className="absolute top-1/2 left-1/2" />}*/}

      {/* Confirmation Dialog */}
      {!isPending && txHash && <ConfirmedDialog txHash={txHash} />}
    </section>
  );
}
