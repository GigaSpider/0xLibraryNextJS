import useWebSocket from "@/hooks/useWebSocketConnection";
import { useApiStore } from "@/hooks/store/apiStore";

export default function WebSockets() {
  const { connection_status } = useApiStore();

  // Call your custom hook. You may want to update 'status' inside the hook or via a callback.
  useWebSocket();

  return (
    <p className="text-gray-500 text-xs">
      Websocket status:
      {connection_status ? (
        <span className="text-green-500 text-xs"> connected</span>
      ) : (
        <span className="text-orange-500 text-xs"> not connected</span>
      )}
    </p>
  );
}
