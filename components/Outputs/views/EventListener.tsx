import { useEventListener } from "@/hooks/eventListener";
import { useState, useEffect } from "react";

export default function EventListener() {
  const { events } = useEventListener();
  const array = Array.from(events);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(dotsInterval);
  }, []);

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
              {event[1] ? (
                event[1].map((log) => (
                  <div key={log.toJSON()["args"][0]}>
                    <div>hello</div>
                    <br />
                    <div>{log.transactionHash}</div>
                  </div>
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
