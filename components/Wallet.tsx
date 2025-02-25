"use client";

import { Wallet as Wállet, HDNodeWallet } from "ethers";
import { useWalletStore } from "@/hooks/store/walletStore";
import { useWalletHook } from "@/hooks/wallet";

import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import BigNumber from "bignumber.js";

// Zod schemas for each form
const sendSchema = z.object({
  network: z.string().nonempty({ message: "field required" }),
  destination: z.string().nonempty("field required"),
  amount: z.string().nonempty("field required"),
});

const bridgeSchema = z.object({
  fromNetwork: z.string().nonempty("field required"),
  toNetwork: z.string().nonempty("field required"),
  amount: z.string().nonempty("field required"),
});

export function formatWei(quantity: bigint): string {
  // Convert the bigint (which represents wei) into a BigNumber.
  const weiBN = new BigNumber(quantity.toString());
  // Convert wei to Ether by dividing by 10^18, ensuring 18 decimals.
  // toFixed(18) returns a string with exactly 18 decimals.
  const etherString = weiBN.dividedBy("1e18").toFixed(18);
  // Split the string into integer and fractional parts.
  const [intPart, fracPart] = etherString.split(".");
  // Pad the integer part with leading zeros to ensure it is 5 digits.
  const intPart2 = intPart.padStart(5, "0");
  // Return the formatted string.
  return `${intPart2}.${fracPart}`;
}

export default function Wallet() {
  const { balance, wallet, set_wallet } = useWalletStore();
  useWalletHook();

  // Create separate form instances with proper typing using z.infer
  const sendForm = useForm<z.infer<typeof sendSchema>>({
    resolver: zodResolver(sendSchema),
    defaultValues: {
      network: "",
      destination: "",
      amount: "",
    },
  });

  const bridgeForm = useForm<z.infer<typeof bridgeSchema>>({
    resolver: zodResolver(bridgeSchema),
    defaultValues: {
      fromNetwork: "",
      toNetwork: "",
      amount: "",
    },
  });

  async function handleCreateNewWallet() {
    const newWallet: HDNodeWallet = Wállet.createRandom();
    set_wallet(newWallet);
  }

  // onSubmit handlers – replace these console.logs with your own logic
  const onSendSubmit = (data: z.infer<typeof sendSchema>) => {
    console.log("Send Ethereum data:", data);
    // Add your send Ethereum logic here
  };

  const onBridgeSubmit = (data: z.infer<typeof bridgeSchema>) => {
    console.log("Bridge Ethereum data:", data);
    // Add your bridge Ethereum logic here
  };

  return (
    <div className="flex-col text-xs text-indigo-500">
      <div className="text-xs">
        address <span>{wallet ? wallet.address : "[no wallet detected]"}</span>
      </div>
      <div className="text-xs">
        main net balance{" "}
        {wallet ? (
          <span>{formatWei(balance.Main.amount)}</span>
        ) : (
          <>[no wallet detected]</>
        )}{" "}
        ETH
      </div>
      <div className="text-xs">
        optimism balance{" "}
        {wallet ? (
          <span>{formatWei(balance.Optimism.amount)}</span>
        ) : (
          <>[no wallet detected]</>
        )}{" "}
        ETH
      </div>
      <div className="text-xs">
        arbitrum balance{" "}
        {wallet ? (
          <span>{formatWei(balance.Arbitrum.amount)}</span>
        ) : (
          <>[no wallet detected]</>
        )}{" "}
        ETH
      </div>

      {/* Wallet Actions Section */}
      <Popover>
        <PopoverTrigger>Wallet Actions</PopoverTrigger>
        <PopoverContent className="w-full max-w-2xl p-6 border-violet-500 bg-black">
          <div className="space-y-8">
            {/* Wallet Management Section */}
            <div>
              <h3 className="font-semibold mb-4">Manage Wallet</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <Label>Create New Wallet</Label>
                  <Button onClick={handleCreateNewWallet}>Create</Button>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Reveal Private Key</Label>
                  <Button variant="outline">Reveal</Button>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Use Another Wallet</Label>
                  <Input placeholder="Enter private key" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Show Previous Wallets</Label>
                  <Button variant="outline">Show</Button>
                </div>
              </div>
            </div>

            {/* Send Ethereum Section */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Send Ethereum</h3>
              <Form {...sendForm}>
                <form onSubmit={sendForm.handleSubmit(onSendSubmit)}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Network Select */}
                    <div className="flex flex-col gap-2">
                      <Label>Network</Label>
                      <Controller
                        name="network"
                        control={sendForm.control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select network" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Networks</SelectLabel>
                                <SelectItem value="main">Mainnet</SelectItem>
                                <SelectItem value="optimism">
                                  Optimism
                                </SelectItem>
                                <SelectItem value="arbitrum">
                                  Arbitrum
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    {/* Destination Address */}
                    <div className="flex flex-col gap-2">
                      <Label>Destination Address</Label>
                      <Input
                        placeholder="Enter destination address"
                        {...sendForm.register("destination")}
                      />
                    </div>
                    {/* Amount */}
                    <div className="flex flex-col gap-2">
                      <Label>Amount</Label>
                      <Input
                        placeholder="Enter amount"
                        {...sendForm.register("amount")}
                      />
                    </div>
                    {/* Send Button */}
                    <div className="flex flex-col gap-2">
                      <Label>Send</Label>
                      <Button type="submit" variant="outline">
                        Send
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </div>

            {/* Bridge Ethereum Section */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">
                Bridge Ethereum Between Networks
              </h3>
              <Form {...bridgeForm}>
                <form onSubmit={bridgeForm.handleSubmit(onBridgeSubmit)}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* From Network */}
                    <div className="flex flex-col gap-2">
                      <Label>From Network</Label>
                      <Controller
                        name="fromNetwork"
                        control={bridgeForm.control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select network" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Networks</SelectLabel>
                                <SelectItem value="main">Mainnet</SelectItem>
                                <SelectItem value="optimism">
                                  Optimism
                                </SelectItem>
                                <SelectItem value="arbitrum">
                                  Arbitrum
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    {/* To Network */}
                    <div className="flex flex-col gap-2">
                      <Label>To Network</Label>
                      <Controller
                        name="toNetwork"
                        control={bridgeForm.control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select network" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Networks</SelectLabel>
                                <SelectItem value="main">Mainnet</SelectItem>
                                <SelectItem value="optimism">
                                  Optimism
                                </SelectItem>
                                <SelectItem value="arbitrum">
                                  Arbitrum
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    {/* Amount */}
                    <div className="flex flex-col gap-2">
                      <Label>Amount</Label>
                      <Input
                        placeholder="Enter amount"
                        {...bridgeForm.register("amount")}
                      />
                    </div>
                    {/* Bridge Button */}
                    <div className="flex flex-col gap-2">
                      <Label>Bridge</Label>
                      <Button type="submit" variant="outline">
                        Bridge
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
