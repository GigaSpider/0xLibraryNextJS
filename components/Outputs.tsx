"use client";

import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useContractStore } from "@/hooks/store/contractStore";
import { ScrollArea } from "./ui/scroll-area";
import EventListener from "@/components/Outputs/views/EventListener";
import ContractOutputs from "./Outputs/views/ContractOutputs";
import { Separator } from "./ui/separator";

export default function Outputs() {
  const { INITIALIZED_CONTRACT, SELECTED_CONTRACT } = useContractStore();
  return (
    <ScrollArea>
      <CardHeader>
        <CardTitle className="text-center">Contract Performance</CardTitle>
        <CardDescription>
          {INITIALIZED_CONTRACT ? (
            <div></div>
          ) : (
            <div>View results and listen for blockchain events</div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {INITIALIZED_CONTRACT ? (
          <ScrollArea className="h-full w-full">
            {SELECTED_CONTRACT!.proxy ? <EventListener /> : <></>}
            <Separator />
            <br />
            <ContractOutputs />
          </ScrollArea>
        ) : (
          <></>
        )}
      </CardContent>
      <CardFooter></CardFooter>
    </ScrollArea>
  );
}
