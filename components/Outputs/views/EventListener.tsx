import { useEventListener } from "@/hooks/eventListener";
import { useContractStore } from "@/hooks/store/contractStore";
import { Interface, Log } from "ethers";
import { useState, useEffect } from "react";

export default function EventListener() {
  const { SELECTED_CONTRACT } = useContractStore();
  const { events } = useEventListener();
  const array = Array.from(events);
  const iface = new Interface(SELECTED_CONTRACT!.abi);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(dotsInterval);
  }, []);

  function parseLog(log: Log) {
    try {
      const parsed = iface.parseLog({
        topics: log.topics as string[],
        data: log.data,
      });

      return <>{parsed?.args[0]?.toString() || "No data"}</>;
    } catch (error) {
      console.error("Error parsing log:", error);
      return <>Error parsing log</>;
    }
  }

  return (
    <div>
      {array ? (
        array.map((event) => (
          <div key={event[0].name}>
            <div>
              {event[0].name}
              {dots}
            </div>
            <div className="p-2">
              {event[1] && event[1].length > 0 ? (
                event[1].map((log, logIndex) => (
                  <div key={`log-${logIndex}`}>{parseLog(log)}</div>
                ))
              ) : (
                <div></div>
              )}
            </div>
          </div>
        ))
      ) : (
        <div>no events detected</div>
      )}
    </div>
  );
}
