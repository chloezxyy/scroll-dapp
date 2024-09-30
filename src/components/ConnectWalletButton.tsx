import { useWallet } from "@/providers/WalletProvider";
import { truncateMiddleText } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Dropdown } from "@/components/Dropdown";

export const ConnectWalletButton: React.FC = () => {
  const { accountData, connectToMetaMask, disconnectMetamask, isConnecting } =
    useWallet();
  return (
    <div>
      {accountData?.address ? (
        <div className="w-[170px]">
          <Dropdown disconnectWallet={disconnectMetamask}>
            <Button className="flex flex-row bg-gray-800 hover:bg-gray-600 active:bg-gray-500 p-4 rounded-[10px] gap-x-2">
              <span className=""> 🟢</span>
              <span className="max-w-[100px] text-white">
                {truncateMiddleText(accountData?.address) ?? "Wallet Address"}
              </span>
            </Button>
          </Dropdown>
        </div>
      ) : (
        <Button
          disabled={isConnecting}
          onClick={connectToMetaMask}
          className="bg-gray-800 hover:bg-gray-600 active:bg-gray-500 text-white p-4 rounded-lg w-full"
        >
          {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Connect Wallet
        </Button>
      )}
    </div>
  );
};
