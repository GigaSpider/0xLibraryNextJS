import { useContractStore } from "@/hooks/store/contractStore";
import { Interface } from "ethers";

export default function ContractOutputs() {
  const { outputs, SELECTED_CONTRACT } = useContractStore();
  const iface = new Interface(SELECTED_CONTRACT!.abi);

  return (
    <div className="text-gray-500">
      <div>Function outputs:</div>
      {outputs ? (
        Object.entries(outputs).map(([functionName, receipts]) => (
          <div key={functionName} className="p-2">
            <h3>{functionName}</h3>
            <ul>
              {receipts.map((receipt) => (
                <li key={receipt.hash} className="ml-2">
                  TX Hash: {receipt.hash}
                  <div className="ml-2">
                    <div>
                      Status: {receipt.status === 1 ? "Success" : "Failed"}
                    </div>
                    <div>Block: {receipt.blockNumber.toString()}</div>
                    <div>
                      {receipt.logs
                        .map((log, index) => {
                          try {
                            const parsedLog = iface.parseLog(log);
                            return (
                              <div key={index}>
                                {parsedLog!.name}:{" "}
                                {parsedLog!.fragment.inputs.map((input, i) => (
                                  <span key={input.name}>
                                    {input.name}:{" "}
                                    {parsedLog!.args[i].toString()}{" "}
                                  </span>
                                ))}
                              </div>
                            );
                          } catch {
                            return null;
                          }
                        })
                        .filter(Boolean)}
                    </div>
                  </div>
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
