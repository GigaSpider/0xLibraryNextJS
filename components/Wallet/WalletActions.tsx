import {
  Wallet as EthersWallet,
  isAddress,
  isHexString,
  parseEther,
  parseUnits,
} from "ethers";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Form } from "@/components/ui/form";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "../ui/scroll-area";
import { Label } from "@/components/ui/label";
import { useWalletStore } from "@/hooks/store/walletStore";
import { useWalletHook } from "@/hooks/wallet";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export enum Network {
  Mainnet = "Mainnet",
  Optimism = "Optimism",
  Arbitrum = "Arbitrum",
  Local = "Sepolia",
}

const sendSchema = z.object({
  network: z.string().nonempty({ message: "field required" }),
  destination: z.string().nonempty("field required"),
  amount: z.string().nonempty("field required"),
});

const connectSchema = z.object({
  key: z.string().nonempty({ message: "private key required" }),
});

export default function Wallet() {
  const [isSendLoading, setIsSendLoading] = useState(false);
  const { wallet, set_wallet, new_wallet, delete_wallet, stored_wallets } =
    useWalletStore();
  useWalletHook();
  const { toast } = useToast();

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

  const onSendSubmit = async (data: z.infer<typeof sendSchema>) => {
    setIsSendLoading(true);
    console.log("Send Ethereum data:", data);

    if (wallet && isAddress(data.destination)) {
      let chainId;
      switch (data.network) {
        case "Main":
          chainId = 1;
          break;
        case "Optimism":
          chainId = 10;
          break;
        case "Sepolia":
          chainId = 11155111;
          break;
        default:
          console.log("error, network out of bounds");
          setIsSendLoading(false);
          return;
      }

      try {
        let nonce;
        try {
          const response = await fetch("/api/GetNonce", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              address: wallet.wallet.address,
              chainId: chainId,
            }),
          });
          const result = await response.json();
          nonce = result.nonce;
        } catch (error) {
          console.log("error getting nonce from api", { error });
          setIsSendLoading(false);
          return;
        }

        // Create transaction object
        const transaction = {
          to: data.destination,
          value: parseEther(data.amount.toString()), // Convert to wei
          // value: data.amount.toString(),
          gasLimit: 40000, // Standard ETH transfer gas limit
          maxFeePerGas: parseUnits("2", "gwei"),
          maxPriorityFeePerGas: parseUnits("1", "gwei"),
          nonce: nonce,
          chainId: chainId,
        };

        // Sign the transaction
        const wallet_from_private_key = new EthersWallet(wallet.private_key);
        const signedTransaction =
          await wallet_from_private_key.signTransaction(transaction);

        // Send signature to API route
        const response = await fetch("/api/SendEthereum", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            signedTransaction: signedTransaction,
            chainId: chainId,
          }),
        });

        const result = await response.json();

        if (response.ok) {
          console.log(result.txHash);
          toast({
            title: "Send success",
            description: `tx hash: ${result.txHash} | sent using the ${data.network} network`,
            duration: 30000,
          });
          setIsSendLoading(false);
        } else {
          setIsSendLoading(false);
          throw new Error(result.error || "Transaction failed");
        }
      } catch (error) {
        console.log(error);
        setIsSendLoading(false);
        toast({
          title: "Send error",
          description: `${error}`,
          variant: "destructive",
        });
      }
    } else {
      console.log("error, invalid form data");
      setIsSendLoading(false);
      toast({
        title: "Send error",
        description: "not an ethereum address",
        variant: "destructive",
      });
      return;
    }
  };

  const onConnectSubmit = async (data: z.infer<typeof connectSchema>) => {
    try {
      if (isHexString(data.key)) {
        console.log("Connecting to private key:", data);
        console.log(data.key);
        const wallet: EthersWallet = new EthersWallet(data.key);
        const private_key = data.key;
        const wallet_object = {
          wallet,
          private_key,
        };
        set_wallet(wallet_object);
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

  function handleDownloadRaw() {
    let content = `Wallets
==================
WARNING: Do not share your private keys with anybody or someone could steal your funds!

`;

    stored_wallets.forEach((wallet, index) => {
      const public_address = wallet.wallet.address;
      const private_key = wallet.private_key;

      content += `

  --------------------------------------------------------------------------------

  wallet ${index}:
  public address: ${public_address}

  private key: ${private_key}`;
    });

    // Create and download the text file
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `wallets_dump_${new Date().toISOString().slice(0, 10)}.txt`; // Unique filename with date
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function handleDownloadEncrypted() {}

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button
            variant="secondary"
            // className="text-violet-400 border-violet-400 bg-black hover:text-black hover:bg-violet-400"
          >
            Wallet Actions ⚡️
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="border-violet-400 background bg-black">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Manage Wallets</DropdownMenuLabel>
            {/* <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                Blockchain Settings
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      View/Edit/Remove Networks
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        {networks && networks.length > 0
                          ? networks.map((network, index) => (
                              <DropdownMenuSub key={index}>
                                <DropdownMenuSubTrigger>
                                  {network.network_name || "Unnamed Wallet"}
                                </DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                  <DropdownMenuSubContent>
                                    <DropdownMenuSub>
                                      <DropdownMenuSubTrigger>
                                        Change RPC URI
                                      </DropdownMenuSubTrigger>
                                      <DropdownMenuPortal>
                                        <DropdownMenuSubContent>
                                          <DropdownMenuItem>
                                            change
                                          </DropdownMenuItem>
                                        </DropdownMenuSubContent>
                                      </DropdownMenuPortal>
                                    </DropdownMenuSub>
                                    <DropdownMenuSub>
                                      <DropdownMenuSubTrigger>
                                        Remove Network
                                      </DropdownMenuSubTrigger>
                                      <DropdownMenuPortal>
                                        <DropdownMenuSubContent>
                                          <Button
                                            onClick={() =>
                                              remove_network(network)
                                            }
                                          >
                                            Confirm Remove
                                          </Button>
                                        </DropdownMenuSubContent>
                                      </DropdownMenuPortal>
                                    </DropdownMenuSub>
                                  </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                              </DropdownMenuSub>
                            ))
                          : "no networks detected"}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      Add Ethereum Network
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <Input placeholder="Enter network name" />
                        <Input placeholder="Enter RPC URI (HTTP ONLY)" />
                        <Button variant="ghost">Submit</Button>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      Reset Settings to Default
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <Button variant="destructive" onClick={reset_networks}>
                          Confirm Reset
                        </Button>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub> */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                View Stored Wallets
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <ScrollArea className="h-96 w-full">
                    {stored_wallets && stored_wallets.length > 0 ? (
                      stored_wallets.map((walletObj, index) => (
                        <DropdownMenuSub key={index}>
                          <DropdownMenuSubTrigger>
                            <span className="text-violet-400">
                              {walletObj.wallet.address || "Unnamed Wallet"}
                            </span>
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                  Show Private Key
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  {walletObj.private_key}
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                  Use Wallet
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  <Button
                                    onClick={() => {
                                      set_wallet(walletObj);
                                    }}
                                  >
                                    Confirm Change
                                  </Button>
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                  Delete Wallet
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  <Button
                                    variant="destructive"
                                    onClick={() => {
                                      delete_wallet(walletObj);
                                    }}
                                  >
                                    Confirm Wallet Deletion
                                  </Button>
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                  Copy
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  <Button
                                    variant="ghost"
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        walletObj.wallet.address,
                                      );
                                    }}
                                  >
                                    Confirm Copy
                                  </Button>
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                      ))
                    ) : (
                      <DropdownMenuItem>
                        No wallets detected in browser storage
                      </DropdownMenuItem>
                    )}
                  </ScrollArea>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                Load Existing Wallet
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <div className="flex flex-col gap-2 md:col-span-3">
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
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Show Private Key</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    {wallet?.private_key}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        navigator.clipboard.writeText(wallet!.private_key);
                        toast({
                          title: "Copied to clipboard",
                          description: "private key copied",
                        });
                      }}
                    >
                      Copy Private Key
                    </Button>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Create New Wallet</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <Button
                  variant="ghost"
                  onClick={() => {
                    new_wallet();
                    toast({
                      title: "New Wallet Created",
                      description: `address ${wallet!.wallet.address}`,
                    });
                  }}
                >
                  Confirm Wallet Creation
                </Button>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Download Wallets</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Download Raw</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <Button variant="ghost" onClick={handleDownloadRaw}>
                      Confirm Download
                    </Button>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    PGP Encrypt and Download
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <Button variant="ghost" onClick={handleDownloadEncrypted}>
                      Confirm Download
                    </Button>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Send Ethereum</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <div>
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
                                      <SelectItem value="Main">
                                        Mainnet(L1)
                                      </SelectItem>
                                      <SelectItem value="Optimism">
                                        Optimism(L2)
                                      </SelectItem>
                                      <SelectItem value="Arbitrum">
                                        Arbitrum(L2)
                                      </SelectItem>
                                      <SelectItem value="Sepolia">
                                        Sepolia(test)
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
                              {isSendLoading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                </>
                              ) : (
                                <>Send</>
                              )}
                            </Button>
                          </div>
                        </div>
                      </form>
                    </Form>
                  </div>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Bridge Networks</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <Input />
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
