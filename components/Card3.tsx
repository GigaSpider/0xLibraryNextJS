"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { isAddress } from "ethers";

export default function Card1() {
  const { toast } = useToast();

  const [input, setInput] = useState("");

  async function CreateMoneroDepositContract() {
    if (isAddress(input)) {
      // Add logic for creating the Ethereum deposit contract
      toast({
        title: "Success",
        description: "Ethereum deposit contract created.",
      });
    } else {
      toast({
        title: "Invalid Ethereum Address",
        description: "Please enter a valid address for your withdrawal.",
        variant: "destructive",
      });
    }
  }

  return (
    <Card className="border-violet-500 h-[350px] w-[350px]">
      <CardHeader>
        <CardTitle className="text-center">Swap XMR ➡️ ETH</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          type="text"
          placeholder="Enter Output Monero Address"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <br />
        <br />
        <Button
          variant="secondary"
          type="submit"
          onClick={CreateMoneroDepositContract}
        >
          Create Monero Deposit Contract
        </Button>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}
