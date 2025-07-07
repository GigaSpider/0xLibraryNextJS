import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export function useWebsocketConnection() {
  const [socket] = useState(() =>
    io("wss://contractmonero.com", {
      path: "/socket.io/", // Correct path for NGINX proxy
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
    });

    socket.on("connect_error", (error) => {
      console.error("Socket.IO connect_error:", error.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket.IO disconnected:", reason, socket.id);
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return socket;
}
