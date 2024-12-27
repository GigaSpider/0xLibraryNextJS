import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

const secretKey = Buffer.from(process.env.SECRET_KEY!, "utf8");
const iv = Buffer.from(process.env.SECRET_IV!, "utf8");

function decryptMoneroAddress(encryptedAddress: string): string {
  const decipher = crypto.createDecipheriv("aes-256-cbc", secretKey, iv);
  let decrypted = decipher.update(encryptedAddress, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("found the api route");
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { encryptedMoneroAddress } = req.body;
  if (!encryptedMoneroAddress) {
    res.status(400).json({ error: "Monero address is required" });
    return;
  }

  try {
    const address = decryptMoneroAddress(encryptedMoneroAddress);
    res.status(200).json({ address });
  } catch (error) {
    console.error("Error hashing Monero address:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
