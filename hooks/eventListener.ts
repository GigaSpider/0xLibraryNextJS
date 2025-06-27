import { EventFragment, Log, EventLog } from "ethers";
import { useContractStore } from "./store/contractStore";
import { useEffect, useState, useRef } from "react";
import { useToast } from "./use-toast";
import { useWalletStore } from "./store/walletStore";

export function useEventListener() {
  const { INITIALIZED_CONTRACT, SELECTED_CONTRACT } = useContractStore();
  const { networks, wallet } = useWalletStore();
  const { toast } = useToast();
  const [events, setEvents] = useState<
    Map<EventFragment, Array<EventLog | Log>>
  >(new Map());

  const eventsRef = useRef<Map<EventFragment, Array<EventLog | Log>>>(
    new Map(),
  );

  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useEffect(() => {
    if (!INITIALIZED_CONTRACT || !SELECTED_CONTRACT || !wallet) return;

    const contract = INITIALIZED_CONTRACT;
    const chainId = SELECTED_CONTRACT.chainId;

    const fragments: EventFragment[] = [];
    contract.interface.forEachEvent((event) => {
      fragments.push(event);
    });

    setEvents(
      new Map(
        fragments.map(
          (fragment) =>
            [fragment, []] as [EventFragment, Array<EventLog | Log>],
        ),
      ),
    );

    async function fetchEvents() {
      console.log(
        `scanning for new events every 10 seconds on chain ${chainId}`,
      );

      for (const event of fragments) {
        console.log(`Checking for event: ${event.name}`);

        try {
          const eventTopicHash = contract.interface.getEvent(
            event.name,
          )!.topicHash;

          const response = await fetch("/api/GetEvents", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contractAddress: SELECTED_CONTRACT!.address,
              eventTopicHash: eventTopicHash,
              chainId: chainId,
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          const recent_events = data.events || [];

          if (recent_events.length > 0) {
            console.log(
              `Found ${recent_events.length} events for ${event.name}`,
            );

            const existing_events = eventsRef.current.get(event) || [];

            const new_events = recent_events.filter(
              (recent_event: any) =>
                !existing_events.some(
                  (existing_event) =>
                    existing_event.transactionHash ===
                    recent_event.transactionHash,
                ),
            );

            if (new_events.length > 0) {
              console.log("checkpoint, proceeding to add to map ", event.name);
              setEvents((prev) => {
                const map = new Map(prev);
                map.set(event, [...existing_events, ...new_events]);
                return map;
              });
            }
          } else {
            console.log("no events found");
          }
        } catch (error) {
          console.error(`Error querying ${event.name} events:`, error);
        }
      }
    }

    // Fetch immediately, then every 10 seconds
    fetchEvents();
    const interval = setInterval(fetchEvents, 10000);

    return () => {
      clearInterval(interval);
      contract.removeAllListeners();
    };
  }, [INITIALIZED_CONTRACT, SELECTED_CONTRACT, wallet, toast, networks]);

  return { events };
}
