import { LogOut } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Dropdown({
  children,
  disconnectWallet,
}: {
  children: React.ReactNode;
  disconnectWallet: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <LogOut className="mr-2 h-4 w-4" />
          <div onClick={disconnectWallet}>Disconnect</div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
