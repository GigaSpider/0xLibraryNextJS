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
    if (!INITIALIZED_CONTRACT) return;

    let index;
    switch (SELECTED_CONTRACT?.network) {
      case "Mainnet":
        index = 0;
        break;
      case "Optimism":
        index = 1;
        break;
      case "Arbitrum":
        index = 2;
        break;
      default:
        index = 0;
        break;
    }

    const provider = networks![index].provider;

    const contract = INITIALIZED_CONTRACT;

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
      console.log("scanning for new events every 10 seconds");

      const block_height = await provider.getBlockNumber();
      console.log(`Current block: ${block_height}`);

      contract.interface.forEachEvent(async (event) => {
        console.log(`Checking for event: ${event.name}`);

        try {
          // Use a bigger block range to find historical events
          const fromBlock = block_height - 1000; // Look back 1000 blocks
          const toBlock = block_height;

          const recent_events = await contract.queryFilter(
            event.name,
            fromBlock,
            toBlock,
          );

          // If we got events, log details of the first one
          if (recent_events.length > 0) {
            console.log(
              `Found ${recent_events.length} events for ${event.name}`,
            );

            const existing_events = eventsRef.current.get(event) || [];

            const new_events = recent_events.filter(
              (recent_event) =>
                !existing_events.some(
                  (existing_event) =>
                    existing_event.transactionHash ==
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

          // Rest of your code...
        } catch (error) {
          console.error(`Error querying ${event.name} events:`, error);
        }
      });
    }

    const interval = setInterval(fetchEvents, 10000);

    return () => {
      clearInterval(interval);
      contract.removeAllListeners();
    };
  }, [INITIALIZED_CONTRACT, SELECTED_CONTRACT, wallet, toast, networks]);

  return { events };
}
