"use client";

import {
  Wallet as Wállet,
  JsonRpcProvider,
  isAddress,
  isHexString,
} from "ethers";
import { useWalletStore } from "@/hooks/store/walletStore";
import { useWalletHook } from "@/hooks/wallet";
import { useToast } from "@/hooks/use-toast";

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

const connectSchema = z.object({
  key: z.string().nonempty({ message: "private key required" }),
});
// const bridgeSchema = z.object({
//   fromNetwork: z.string().nonempty("field required"),
//   toNetwork: z.string().nonempty("field required"),
//   amount: z.string().nonempty("field required"),
// });

export function formatWei(quantity: bigint): string {
  const weiBN = new BigNumber(quantity.toString());
  const etherString = weiBN.dividedBy("1e18").toFixed(18);
  const [intPart, fracPart] = etherString.split(".");
  const intPart2 = intPart.padStart(5, "0");
  return `${intPart2}.${fracPart}`;
}

export default function Wallet() {
  const { balance, wallet, set_wallet, private_key } = useWalletStore();
  useWalletHook();

  const { toast } = useToast();

  // Create separate form instances with proper typing using z.infer
  const sendForm = useForm<z.infer<typeof sendSchema>>({
    resolver: zodResolver(sendSchema),
    defaultValues: {
      network: "",
      destination: "",
      amount: "",
    },
  });

  const connectForm = useForm<z.infer<typeof connectSchema>>({
    resolver: zodResolver(connectSchema),
    defaultValues: {
      key: "",
    },
  });

  // const bridgeForm = useForm<z.infer<typeof bridgeSchema>>({
  //   resolver: zodResolver(bridgeSchema),
  //   defaultValues: {
  //     fromNetwork: "",
  //     toNetwork: "",
  //     amount: "",
  //   },
  // });

  async function handleCreateNewWallet() {
    const newWallet: Wállet = new Wállet(Wállet.createRandom().privateKey);
    set_wallet(newWallet);
  }

  const onConnectSubmit = async (data: z.infer<typeof connectSchema>) => {
    try {
      if (isHexString(data.key)) {
        console.log("Connecting to private key:", data);
        console.log(data.key);
        const existing_wallet = new Wállet(data.key);
        set_wallet(existing_wallet);
        toast({
          title: "success",
          description: `client wallet set to private key: ${data.key}`,
        });
      } else {
        toast({
          title: "error",
          description: `not a valid key`,
          variant: "destructive",
        });
        return;
      }
    } catch (error) {
      toast({
        title: "error",
        description: `${error}`,
        variant: "destructive",
      });
      return;
    }
  };

  // onSubmit handlers – replace these console.logs with your own logic
  const onSendSubmit = async (data: z.infer<typeof sendSchema>) => {
    console.log("Send Ethereum data:", data);
    // Add your send Ethereum logic here
    if (wallet && isAddress(data.destination)) {
      let provider;
      switch (data.network) {
        case "Main":
          provider = new JsonRpcProvider(process.env.NEXT_PUBLIC_MAINNET_URI!);
          break;
        case "Optimism":
          provider = new JsonRpcProvider(process.env.NEXT_PUBLIC_MAINNET_URI!);
          break;
        case "Arbitrum":
          provider = new JsonRpcProvider(process.env.NEXT_PUBLIC_MAINNET_URI!);
          break;
        default:
          console.log("error, network out of bounds");
          return;
      }

      const connected_wallet = new Wállet(private_key!, provider);

      try {
        const tx_response = await connected_wallet.sendTransaction({
          to: data.destination,
          value: data.amount,
        });
        const tx_hash = tx_response.hash;
        console.log(tx_hash);
        toast({
          title: "send success",
          description: ``,
        });
      } catch (error) {
        console.log(error);
        toast({
          title: "send error",
          description: `${error}`,
          variant: "destructive",
        });
      }
    } else {
      console.log("error, invalid form data");
      toast({
        title: "send error",
        description: "not an ethereum address",
        variant: "destructive",
      });
      return;
    }
  };

  // const onBridgeSubmit = async (data: z.infer<typeof bridgeSchema>) => {
  //   console.log("Bridge Ethereum data:", data);

  //   let source_provider;
  //   let target_provider;

  //   switch (data.fromNetwork) {
  //     case "main":
  //       source_provider = new JsonRpcProvider(
  //         process.env.NEXT_PUBLIC_MAINNET_URI!,
  //       );
  //       break;
  //     case "optimism":
  //       source_provider = new JsonRpcProvider(
  //         process.env.NEXT_PUBLIC_OPTIMISM_URI!,
  //       );
  //       break;
  //     case "arbitrum":
  //       source_provider = new JsonRpcProvider(
  //         process.env.NEXT_PUBLIC_ARBITRUM_URI!,
  //       );
  //       break;
  //     default:
  //       console.log("error, network out of bounds");
  //       return;
  //   }

  //   switch (data.toNetwork) {
  //     case "main":
  //       target_provider = new JsonRpcProvider(
  //         process.env.NEXT_PUBLIC_MAINNET_URI!,
  //       );
  //       break;
  //     case "optimism":
  //       target_provider = new JsonRpcProvider(
  //         process.env.NEXT_PUBLIC_OPTIMISM_URI!,
  //       );
  //       break;
  //     case "arbitrum":
  //       target_provider = new JsonRpcProvider(
  //         process.env.NEXT_PUBLIC_ARBITRUM_URI!,
  //       );
  //       break;
  //     default:
  //       console.log("error, network out of bounds");
  //       return;
  //   }

  //   await bridge(source_provider, target_provider);
  // };

  return (
    <div className="flex-col text-xs text-gray-400">
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
                  <Button
                    variant="outline"
                    onClick={() => {
                      toast({
                        title: "Private Key",
                        description: (
                          <div className="flex items-center justify-between w-full">
                            <span className="max-w-xs break-words whitespace-pre-wrap">
                              {private_key}
                            </span>
                            <Button
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(private_key!);
                              }}
                            >
                              Copy
                            </Button>
                          </div>
                        ),
                      });
                    }}
                  >
                    Reveal
                  </Button>
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <Label>Use Another Wallet</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter private key"
                      {...connectForm.register("key")}
                    />
                    <Button
                      variant="outline"
                      type="submit"
                      onClick={connectForm.handleSubmit(onConnectSubmit)}
                    >
                      Submit
                    </Button>
                  </div>
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
                                <SelectItem value="Main">Mainnet</SelectItem>
                                <SelectItem value="Optimism">
                                  Optimism
                                </SelectItem>
                                <SelectItem value="Arbitrum">
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
                      <Label>Amount in Wei</Label>
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

            {/* <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">
                Bridge Ethereum Between Networks
              </h3>
              <Form {...bridgeForm}>
                <form onSubmit={bridgeForm.handleSubmit(onBridgeSubmit)}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <div className="flex flex-col gap-2">
                      <Label>Amount</Label>
                      <Input
                        placeholder="Enter amount"
                        {...bridgeForm.register("amount")}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label>Bridge</Label>
                      <Button type="submit" variant="outline">
                        Bridge
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
              </div> */}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
