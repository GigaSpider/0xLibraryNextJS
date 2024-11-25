import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

const secretKey = Buffer.from(process.env.SECRET_KEY!, "utf8");
const iv = Buffer.from(process.env.SECRET_IV!, "utf8");

function encryptMoneroAddress(address: string): string {
  console.log(secretKey, " ", iv);
  const cipher = crypto.createCipheriv("aes-256-cbc", secretKey, iv);
  let encrypted = cipher.update(address, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("found the api route");
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { moneroAddress } = req.body;
  if (!moneroAddress) {
    res.status(400).json({ error: "Monero address is required" });
    return;
  }

  try {
    const hashedAddress = encryptMoneroAddress(moneroAddress);
    res.status(200).json({ hashedAddress });
  } catch (error) {
    console.error("Error hashing Monero address:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
