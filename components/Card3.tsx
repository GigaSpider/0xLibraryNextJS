"use client";

import ContractDashboard from "@/components/Card3/views/ContractDashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useContractStore } from "@/hooks/store/contractStore";

export default function Card3() {
  const { INITIALIZED_CONTRACT } = useContractStore();
  return (
    <Card className="border-violet-500 w-full md:w-1/3 min-w-[200px] aspect-square bg-black flex flex-col">
      <CardHeader>
        <CardTitle className="text-center">Contract Dashboard</CardTitle>
        <CardDescription className="text-center">
          {INITIALIZED_CONTRACT ? (
            <></>
          ) : (
            <>Initialize contract to view Dashboard</>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ContractDashboard />
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}
