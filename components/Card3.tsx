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

export default function Card3() {
  return (
    <Card className="border-violet-500 w-full md:w-1/3 min-w-[200px] aspect-square bg-black flex flex-col">
      <CardHeader>
        <CardTitle className="text-center">Contract Dashboard</CardTitle>
        <CardDescription className="text-center">
          Initialize contract to view Dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ContractDashboard />
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}
