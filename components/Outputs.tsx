"use client";

import { CardDescription, CardTitle } from "@/components/ui/card";
import { useContractStore } from "@/hooks/store/contractStore";
import EventListener from "@/components/Outputs/views/EventListener";
import ContractOutputs from "./Outputs/views/ContractOutputs";

export default function Outputs() {
  const { INITIALIZED_CONTRACT, SELECTED_CONTRACT } = useContractStore();
  return (
    <div className="h-full flex flex-col">
      {" "}
      {/* Add flex container */}
      <br />
      <CardTitle className="text-center">Contract Performance</CardTitle>
      <CardDescription className="text-center">
        {INITIALIZED_CONTRACT ? (
          <div></div>
        ) : (
          <div>View results and listen for blockchain events</div>
        )}
      </CardDescription>
      <div className="flex-1 min-h-0">
        {" "}
        {/* Key changes here */}
        {INITIALIZED_CONTRACT ? (
          <div className="h-full flex flex-col">
            {" "}
            {/* Add height and flex */}
            {SELECTED_CONTRACT!.proxy ? <EventListener /> : <></>}
            <div className="flex-1 min-h-0">
              {" "}
              {/* Wrap ContractOutputs */}
              <ContractOutputs />
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
