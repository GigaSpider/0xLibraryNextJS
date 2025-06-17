"use client";

import ContractDashboard from "./Inputs/views/ContractDashboard";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useContractStore } from "@/hooks/store/contractStore";

export default function Inputs() {
  const { INITIALIZED_CONTRACT } = useContractStore();
  return (
    <ScrollArea className="h-full w-full">
      <CardHeader>
        <CardTitle className="text-center">Contract Execution</CardTitle>
        <CardDescription className="text-center">
          {INITIALIZED_CONTRACT ? (
            <></>
          ) : (
            <>Provide consideration and sign agreements</>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ContractDashboard />
      </CardContent>
      <CardFooter></CardFooter>
    </ScrollArea>
  );
}
