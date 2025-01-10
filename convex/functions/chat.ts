import { mutation, query } from "../_generated/server";

export const getChannels = query(async ({ db }) => {
  return db.query("channels").collect();
});

export const getMessages = query(
  async (
    { db },
    { channelId, lastTimestamp }: { channelId: string; lastTimestamp: number },
  ) => {
    const messages = await db
      .query("messages")
      .filter((q) =>
        q.and(
          q.eq(q.field("channelId"), channelId),
          q.gt(q.field("timestamp"), lastTimestamp),
        ),
      )
      .order("asc")
      .collect();
    return messages;
  },
);

export const getAllMessages = query(async ({ db }) => {
  const allMessages = await db.query("messages").collect();
  return allMessages;
});

export const createChannel = mutation(
  async ({ db }, { name }: { name: string }) => {
    return db.insert("channels", { name });
  },
);

export const sendMessage = mutation(
  async (
    { db },
    {
      channelId,
      author,
      text,
    }: { channelId: string; author: string; text: string },
  ) => {
    return db.insert("messages", {
      channelId,
      author,
      text,
      timestamp: Date.now(),
    });
  },
);
