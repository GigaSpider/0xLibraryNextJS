import { useContractStore } from "@/hooks/store/contractStore";

export default function ContractOutputs() {
  const { outputs } = useContractStore();

  return (
    <div className="text-gray-500">
      <div>Function outputs:</div>
      {outputs ? (
        Object.entries(outputs).map(([functionName, receipts]) => (
          <div key={functionName} className="p-2">
            <h3>{functionName}</h3>
            <ul>
              {receipts.map((receipt) => (
                <li key={receipt.hash}>
                  TX Hash: {receipt.hash.substring(0, 10)}...
                  {/* Display other receipt properties as needed */}
                  Status: {receipt.status === 1 ? "Success" : "Failed"}
                  Block: {receipt.blockNumber.toString()}
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <></>
      )}
    </div>
  );
}
