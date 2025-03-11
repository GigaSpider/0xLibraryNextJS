"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useContractStore } from "@/hooks/store/contractStore";
import { ScrollArea } from "./ui/scroll-area";
import EventListener from "@/components/Card1/views/EventListener";
import ContractOutputs from "./Card3/views/ContractOutputs";

export default function Card1() {
  const { INITIALIZED_CONTRACT } = useContractStore();
  return (
    <Card className="border-violet-500 w-full md:w-1/3 min-w-[200px] aspect-square bg-black flex flex-col">
      <CardHeader>
        <CardTitle className="text-center">Event Listener</CardTitle>
        <CardDescription>
          {INITIALIZED_CONTRACT ? (
            <div>Event listeners active</div>
          ) : (
            <div>Initialize contract to listen for events</div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {INITIALIZED_CONTRACT ? (
          <ScrollArea className="h-full w-full">
            <ContractOutputs />

            <br />

            {INITIALIZED_CONTRACT.proxy ? <EventListener /> : <></>}
          </ScrollArea>
        ) : (
          <></>
        )}
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}
