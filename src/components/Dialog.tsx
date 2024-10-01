import { Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export function ConfirmedDialog({ txHash }: { txHash: string }) {
  const [open, setOpen] = useState(!!txHash);

  const copyText = () => {
    navigator.clipboard.writeText(txHash);
    alert("Copied to clipboard");
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transaction confirmed!</DialogTitle>
          <DialogDescription>
            You can view your transaction on the blockchain explorer. Below is
            your transaction hash:
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input id="link" defaultValue={txHash} readOnly />
          </div>
          {/* copy text */}
          <Button type="submit" size="sm" className="px-3">
            <span className="sr-only">Copy</span>
            <div onClick={copyText}>
              <Copy className="h-4 w-4" />
            </div>
          </Button>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
