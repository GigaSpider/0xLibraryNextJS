"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
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

  const etherscanlink = `https://holesky.etherscan.io/address/${address}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-1 flex items-center justify-between space-x-2 bg-background/40 backdrop-blur-sm border-muted hover:bg-background/60 transition-all">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="px-1 py-0 text-xs">
            {label}
          </Badge>
          <span className="text-xs font-mono text-muted-foreground">
            {address}
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
          <Button variant="outline" className="h-6 px-2 text-xs">
            <Link
              href={etherscanlink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Etherscan
            </Link>
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default EnhancedContractInfo;
