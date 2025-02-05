"use client";

import { Label } from "@/components/ui/label";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

export interface EnhancedContractInfoProps {
  address: string;
  label: string;
}

export const EnhancedContractInfo = ({
  address,
  label,
}: EnhancedContractInfoProps) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const etherscanlink = `https://optimistic.etherscan.io/address/${address}`;

  return (
    <div className="p-1 flex items-center justify-between space-x-2">
      <div className="flex items-center space-x-2">
        <Label className="px-1 py-0 text-xs">{label}</Label>
        <span className="text-xs font-mono text-muted-foreground">
          <Link href={etherscanlink} target="_blank" rel="noopener noreferrer">
            {address}
          </Link>
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={copyToClipboard}
          className="h-5 w-5"
        >
          <Copy className={`h-3 w-3 ${copied ? "text-green-500" : ""}`} />
        </Button>
      </div>
    </div>
  );
};

export default EnhancedContractInfo;
