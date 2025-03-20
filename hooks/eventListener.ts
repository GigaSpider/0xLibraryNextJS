import { EventFragment, Log, EventLog } from "ethers";
import { useContractStore } from "./store/contractStore";
import { useEffect, useState, useRef } from "react";
import { useToast } from "./use-toast";
import { useWalletStore } from "./store/walletStore";

export function useEventListener() {
  const { INITIALIZED_CONTRACT, SELECTED_CONTRACT } = useContractStore();
  const { providers, private_key } = useWalletStore();
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

    const provider = providers![index];

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

      // Debug the contract and provider
      console.log("Contract address:", contract.target);
      console.log("Provider network:", provider._network?.name);

      const block_height = await provider.getBlockNumber();
      console.log(`Current block: ${block_height}`);

      contract.interface.forEachEvent(async (event) => {
        console.log(`Checking for event: ${event.name}`);

        try {
          // Use a bigger block range to find historical events
          const fromBlock = block_height - 10; // Look back 1000 blocks
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
              toast({
                title: "Contract Event Detected",
                description: `${event.name}`,
              });
              setEvents((prev) => {
                const map = new Map(prev);
                map.set(event, [...existing_events, ...new_events]);
                return map;
              });
            }

            // const firstEvent = recent_events[0];
            // console.log(`First event block: ${firstEvent.blockNumber}`);
            // console.log(`First event tx: ${firstEvent.transactionHash}`);

            // // Try to access args if it's an EventLog
            // if ("args" in firstEvent) {
            //   console.log(`Event args:`, firstEvent.args);
            // } else {
            //   console.log(`Raw log data:`, firstEvent.data);
            // }
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
  }, [INITIALIZED_CONTRACT, SELECTED_CONTRACT, private_key, toast, providers]);

  return { events };
}
