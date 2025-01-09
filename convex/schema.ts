import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  channels: defineTable({
    name: v.string(), // Channel name
  }),
  messages: defineTable({
    channelId: v.string(), // Channel ID to link messages to a channel
    author: v.string(), // Message sender
    text: v.string(), // Message content
    timestamp: v.number(), // Unix timestamp for message ordering
  }),
});
