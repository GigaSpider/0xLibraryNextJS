import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useWebsocketStore, Status } from "@/hooks/store/websocketStore";

export function useWebsocketConnection() {
  const { set_status } = useWebsocketStore();
  const [socket] = useState(() =>
    io("wss://contractmonero.com", {
      path: "/socket.io/",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      query: { EIO: 4 },
    }),
  );

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket.IO connected", socket.id);
      set_status(Status.connected);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket.IO connect_error:", error.message);
      set_status(Status.pending);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket.IO disconnected:", reason, socket.id);
      set_status(Status.disconnected);
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return socket;
}
