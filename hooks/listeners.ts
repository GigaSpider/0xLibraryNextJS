import { useEffect } from "react";
import { Contract } from "ethers";
import ETH_XMR from "@/components/Contracts/ETH_XMR.json";
import XMR_ETH from "@/components/Contracts/XMR_ETH.json";
import { useSwapStore } from "@/hooks/store/zustand";

export function useEthXmrContractListener() {
  const { ETH_XMR_ADDRESS, provider, update_XMR_TXID } = useSwapStore();

  useEffect(() => {
    if (!ETH_XMR_ADDRESS) return;

    const contract = new Contract(ETH_XMR_ADDRESS, ETH_XMR.abi, provider);

    async function handleConfirmSwapSuccess(TxID: string) {
      console.log("Transaction sent your txid is ", TxID);
      update_XMR_TXID(TxID);
    }

    async function handleConfirmSwapFailure() {
      console.log("Your swap has failed");
    }

    contract.on("ConfirmSwapSuccess", async (TxID: string) => {
      await handleConfirmSwapSuccess(TxID);
    });

    contract.on("ConfirmSwapFailure", async () => {
      await handleConfirmSwapFailure();
    });
  }, [ETH_XMR_ADDRESS, provider, update_XMR_TXID]);
}

export function useXmrEthContractListener() {
  const {
    XMR_ETH_ADDRESS,
    XMR_DEPOSIT_ADDRESS,
    update_XMR_DEPOSIT_ADDRESS,
    provider,
  } = useSwapStore();

  useEffect(() => {
    if (!XMR_ETH_ADDRESS) return;

    const contract = new Contract(XMR_ETH_ADDRESS, XMR_ETH.abi, provider);

    async function handleHaveMoneroAddress(encryptedMoneroAddress: string) {
      console.log(encryptedMoneroAddress, "decrypting address");

      const response = await fetch("/api/decrypt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          encryptedMoneroAddress: encryptedMoneroAddress,
        }),
      });

      const { address } = await response.json();

      console.log("address decrypted: ", address);

      update_XMR_DEPOSIT_ADDRESS(address as string);
    }

    async function handleDontHaveMoneroAddress() {
      console.log("dont have monero deposit address");
    }

    async function handleMoneroReceived(withdrawalConfirmation: string) {
      console.log("monero received", withdrawalConfirmation);
    }

    async function handleEthSent(
      withdrawalAmount: number,
      withdrawalAddress: string,
    ) {
      console.log(
        `amount ${withdrawalAmount} withdrawn to ${withdrawalAddress}`,
      );
    }

    contract.on("haveMoneroAddress", async (encryptedMoneroAddress: string) => {
      // add logic to push to events that user can see on the front end through zustand
      console.log(
        "Monero Address Received from smart contract",
        encryptedMoneroAddress,
      );
      await handleHaveMoneroAddress(encryptedMoneroAddress);
    });

    contract.on("dontHaveMoneroAddress", async () => {
      await handleDontHaveMoneroAddress();
    });

    contract.on("moneroReceived", async (withdrawalConfirmation: string) => {
      console.log("Monero received");
      await handleMoneroReceived(withdrawalConfirmation);
    });

    contract.on(
      "ethSent",
      async (withdrawalAmount: number, withdrawalAddress: string) => {
        await handleEthSent(withdrawalAmount, withdrawalAddress);
      },
    );
  }, [XMR_ETH_ADDRESS, provider]);
}
