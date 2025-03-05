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
import EventListener from "@/components/Card1/views/EventListener";

export default function Card1() {
  const { INITIALIZED_CONTRACT } = useContractStore();
  return (
    <Card className="border-violet-500 w-full md:w-1/3 min-w-[200px] aspect-square bg-black flex flex-col">
      <CardHeader>
        <CardTitle className="text-center">Event Listener</CardTitle>
        <CardDescription>
          {INITIALIZED_CONTRACT ? (
            <>Event listeners active</>
          ) : (
            <>Initialize contract to listen for events</>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {INITIALIZED_CONTRACT ? <EventListener /> : <></>}
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}
