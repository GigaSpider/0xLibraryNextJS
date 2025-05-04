import type { NextApiRequest, NextApiResponse } from "next";
import { groth16 } from "snarkjs";
import path from "path";
import fs from "fs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const input = req.body;

    // Paths relative to your project root
    const wasmPath = path.join(process.cwd(), "public", "withdraw.wasm");
    const zkeyPath = path.join(process.cwd(), "public", "withdraw_final.zkey");

    const { proof, publicSignals } = await groth16.fullProve(
      input,
      wasmPath,
      zkeyPath,
    );

    return res.status(200).json({ proof, publicSignals });
  } catch (error) {
    console.error("Error generating proof:", error);
    return res.status(500).json({
      message: "Error generating proof",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
