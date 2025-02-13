"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useContractStore } from "@/hooks/store/contractStore";
import InitializationMenu from "./InitializationMenu";

export default function ContractInitialization() {
  const { SELECTED_CONTRACT } = useContractStore();
  return (
    <Card className="border-violet-500 h-[400px] w-[400px]">
      <CardHeader className="text-center">
        <CardTitle>Contract Initialization</CardTitle>
        {SELECTED_CONTRACT ? (
          <></>
        ) : (
          <CardDescription>Select a contract from the library</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {SELECTED_CONTRACT ? <InitializationMenu /> : <></>}
      </CardContent>
    </Card>
  );
}
