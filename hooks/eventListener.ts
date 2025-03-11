import { EventFragment, ParamType } from "ethers";
import { useContractStore } from "./store/contractStore";
import { useEffect, useState } from "react";
import { useToast } from "./use-toast";

interface EventEmission {
  args: any[];
  emission: string;
  timestamp: number;
}

// Define a clear type for each event
interface EventData {
  index: string;
  name: string;
  vars: readonly ParamType[];
  emissions?: EventEmission[];
}

export function useEventListener() {
  const { INITIALIZED_CONTRACT: contract } = useContractStore();
  const { toast } = useToast();
  const [events, setEvents] = useState<Map<EventFragment, EventData>>(
    new Map(),
  );

  useEffect(() => {
    if (!contract) return;

    // Initialize the events map with all events and empty emissions arrays
    contract.interface.forEachEvent((event) => {
      setEvents((prev) => {
        const newMap = new Map(prev);
        if (!newMap.has(event)) {
          newMap.set(event, {
            index: event.topicHash,
            name: event.name,
            vars: event.inputs,
            // emissions: [], // Initialize with empty array
          });
        }
        return newMap;
      });
    });

    // Set up listeners for all events
    contract.interface.forEachEvent((event) => {
      contract.on(event.name, (...args) => {
        toast({
          title: "Event Detected",
          description: `${event.name}`,
        });
        setEvents((prev) => {
          const newMap = new Map(prev);
          const eventData = newMap.get(event);
          if (eventData) {
            // Create a new object with the updated emissions array
            newMap.set(event, {
              ...eventData,
              emissions: [
                ...(eventData.emissions || []),
                {
                  args,
                  emission: event.topicHash,
                  timestamp: Date.now(),
                },
              ],
            });
          }
          return newMap;
        });
      });
    });

    return () => {
      const cleanup = async () => {
        await contract.removeAllListeners();
      };
      cleanup().catch(console.error);
    };
  }, [contract, toast]);

  return { events };
}
