import { useEffect } from "react";

export default function useWebSocket() {
  const uri = process.env.API_URI!;

  useEffect(() => {
    const socket = new WebSocket(uri);

    socket.onopen = () => {
      console.log("Established connection with websocket server");
    };
  });
}
