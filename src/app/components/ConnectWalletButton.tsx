import { useWallet } from "@/providers/WalletContextProvider";
import { truncateMiddleText } from "@/lib/utils";

export const ConnectWalletButton: React.FC = () => {
  const { accountData, connectToMetaMask, disconnectMetamask, isConnecting } =
    useWallet();
  return (
    <div>
      {accountData?.address ? (
        <div className="w-[170px]">
          <button
            onClick={disconnectMetamask}
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
  );
};
