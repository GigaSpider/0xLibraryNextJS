import { useEventListener } from "@/hooks/eventListener";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function EventListener() {
  const { events } = useEventListener();
  const array = Array.from(events);

  return (
    <ScrollArea className="h-full w-full">
      <div>Listening in progress</div>
      <br />
      {array ? (
        array.map((event) => (
          <div key={event[1].index}>
            <div>{event[1].name}</div>
            <br />
            <div>
              {event[1].emissions ? (
                event[1].emissions.map((emission) => (
                  <div key={emission.timestamp}>{emission.args}</div>
                ))
              ) : (
                <div>no emissions</div>
              )}
            </div>
            <br />
          </div>
        ))
      ) : (
        <div>no events detected</div>
      )}
    </ScrollArea>
  );
}
