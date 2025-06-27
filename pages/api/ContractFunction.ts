import { NextApiRequest, NextApiResponse } from "next";
import { JsonRpcProvider, Transaction } from "ethers";

// Define error interfaces for better type safety
interface ErrorWithInfo {
  info?: {
    error?: {
      message?: string;
    };
  };
  code?: string | number;
  data?: unknown;
  message?: string;
  reason?: string;
}

interface GenericError {
  message?: string;
  code?: string | number;
  data?: unknown;
  reason?: string;
  transaction?: unknown;
  receipt?: unknown;
  stack?: string;
}

// Utility function to safely extract error properties
function extractErrorInfo(error: unknown): ErrorWithInfo & GenericError {
  if (typeof error === "object" && error !== null) {
    const err = error as Record<string, unknown>;
    return {
      message: typeof err.message === "string" ? err.message : undefined,
      code:
        typeof err.code === "string" || typeof err.code === "number"
          ? err.code
          : undefined,
      data: err.data,
      reason: typeof err.reason === "string" ? err.reason : undefined,
      info:
        typeof err.info === "object" && err.info !== null
          ? (err.info as ErrorWithInfo["info"])
          : undefined,
      transaction: err.transaction,
      receipt: err.receipt,
      stack: typeof err.stack === "string" ? err.stack : undefined,
    };
  }

  return {
    message: typeof error === "string" ? error : "Unknown error",
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { chainId, signature } = req.body;

  if (!chainId || !signature) {
    return res
      .status(400)
      .json({ error: "Network and signature are required" });
  }

  const networkConfig: Record<
    number,
    { uri: string | undefined; chainId: number }
  > = {
    1: { uri: process.env.MAINNET_URI, chainId: 1 },
    10: { uri: process.env.OPTIMISM_URI, chainId: 10 },
    11155111: { uri: process.env.SEPOLIA_URI, chainId: 11155111 },
  };

  const config = networkConfig[chainId];
  if (!config || !config.uri) {
    return res.status(400).json({ error: `Unsupported network: ${chainId}` });
  }

  console.log("entering try block");
  try {
    const provider = new JsonRpcProvider(networkConfig[chainId].uri);

    const parsedTx = Transaction.from(signature);

    try {
      console.log("testing transaction");
      await provider.call({
        to: parsedTx.to,
        data: parsedTx.data,
        value: parsedTx.value,
        from: parsedTx.from,
        gasLimit: parsedTx.gasLimit,
        gasPrice: parsedTx.gasPrice,
        maxFeePerGas: parsedTx.maxFeePerGas,
        maxPriorityFeePerGas: parsedTx.maxPriorityFeePerGas,
      });
    } catch (simulationError: unknown) {
      // ✅ Fixed error #1
      console.log("Simulation failed with reason:", simulationError);

      const errorInfo = extractErrorInfo(simulationError);

      return res.status(400).json({
        error: "Transaction would fail",
        reason:
          errorInfo.info?.error?.message ||
          errorInfo.reason ||
          errorInfo.message,
        code: errorInfo.code,
        data: errorInfo.data,
      });
    }

    // Send transaction
    const txHash = await provider.send("eth_sendRawTransaction", [signature]);
    console.log("Transaction sent:", txHash);

    // Wait for receipt
    const receipt = await provider.waitForTransaction(txHash);

    if (!receipt) {
      return res.status(408).json({
        error: "Transaction timeout",
        txHash,
        message: "Transaction was sent but receipt not received within timeout",
      });
    }

    // Check if transaction failed
    if (receipt.status === 0) {
      // Transaction was mined but failed
      let revertReason = null;
      try {
        // Try to get revert reason by replaying the transaction
        const tx = await provider.getTransaction(txHash);
        if (tx) {
          await provider.call(tx);
        }
      } catch (revertError: unknown) {
        // ✅ Fixed error #2
        const errorInfo = extractErrorInfo(revertError);
        revertReason = errorInfo.message;
      }

      console.log({ revertReason });

      return res.status(400).json({
        error: "Transaction failed",
        txHash,
        receipt,
        revertReason,
        gasUsed: receipt.gasUsed?.toString(),
      });
    }

    // Success case
    return res.status(200).json({
      success: true,
      txHash,
      receipt: {
        blockNumber: receipt.blockNumber,
        blockHash: receipt.blockHash,
        gasUsed: receipt.gasUsed?.toString(),
        effectiveGasPrice: receipt.gasPrice?.toString(),
        status: receipt.status,
        logs: receipt.logs,
      },
    });
  } catch (error: unknown) {
    // ✅ Fixed error #3
    console.error("Full error object:", error);

    const errorInfo = extractErrorInfo(error);

    // Extract maximum error information
    const responseErrorInfo = {
      message: errorInfo.message || "Unknown error",
      code: errorInfo.code,
      data: errorInfo.data,
      reason: errorInfo.reason,
      transaction: errorInfo.transaction,
      receipt: errorInfo.receipt,
      stack:
        process.env.NODE_ENV === "development" ? errorInfo.stack : undefined,
    };

    return res.status(500).json({
      error: "Failed to send transaction",
      details: responseErrorInfo,
    });
  }
}
