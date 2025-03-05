import { useEventListener } from "@/hooks/eventListener";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function EventListener() {
  useEventListener();

  return (
    <ScrollArea className="h-full w-full">Listening in progress</ScrollArea>
  );
}
