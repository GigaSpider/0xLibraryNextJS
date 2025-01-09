import type { NextApiRequest, NextApiResponse } from "next";
import Pusher from "pusher";

const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { channel, message } = req.body;

    console.log("senind message to pusher", message);

    await pusherServer.trigger(channel, "message", message);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Pusher error:", error);
    return res.status(500).json({ error: "Error triggering event" });
  }
}
