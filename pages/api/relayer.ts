import { NextApiRequest, NextApiResponse } from "next";
import { Wallet, Contract, JsonRpcProvider, Interface, Log } from "ethers";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  console.log("running serverless relayer request");

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const private_key = process.env.PRIVATE_KEY!;
  const uri = process.env.OPTIMISM_URI;
  const { proof, root, nullifierHash, destination, contractAddress } = req.body;

  if (!nullifierHash || !destination || !proof || !root || !contractAddress) {
    res.status(400).json({ error: "Missing required parameters" });
    return;
  }

  const provider = new JsonRpcProvider(uri);
  const wallet = new Wallet(private_key, provider);
  const public_address = wallet.address;
  const contract = new Contract(contractAddress, zk.abi, wallet);
  const contract_interface: Interface = contract.interface;

  try {
    const tx = await contract.USERWithdrawal({
      Proof: proof,
      Root: root,
      NullifierHash: nullifierHash,
      Recipient: destination,
      Relayer: public_address,
    });
    const receipt = await tx.wait();

    // Parse the logs from the transaction receipt
    const logs: Log[] = receipt.logs.map((log: Log) => {
      try {
        return contract_interface.parseLog(log);
      } catch (error) {
        console.error("Error in parsing log ", error);
        return error;
      }
    });

    const tx_hash = receipt.hash; // Fix: Use hash property instead of tx_hash

    res.status(200).json({
      confirmation: tx_hash,
      logs: logs,
    });
  } catch (error) {
    console.log("Error in relayer");
    console.error(error);
    res.status(500).json({ error: error });
  }
}

const zk = {
  _format: "hh-sol-artifact-1",
  contractName: "ZK",
  sourceName: "contracts/ZK.sol",
  abi: [
    {
      inputs: [],
      name: "ReentrancyGuardReentrantCall",
      type: "error",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "commitment",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "uint32",
          name: "leafIndex",
          type: "uint32",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "timestamp",
          type: "uint256",
        },
      ],
      name: "DepositEvent",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          indexed: false,
          internalType: "bytes32",
          name: "nullifierHash",
          type: "bytes32",
        },
        {
          indexed: true,
          internalType: "address",
          name: "relayer",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "Fee",
          type: "uint256",
        },
      ],
      name: "WithdrawEvent",
      type: "event",
    },
    {
      inputs: [],
      name: "Denomination",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "FIELD_SIZE",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "Oracle",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "ROOT_HISTORY_SIZE",
      outputs: [
        {
          internalType: "uint32",
          name: "",
          type: "uint32",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "Commitment",
          type: "bytes32",
        },
      ],
      name: "USERDeposit",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes",
          name: "Proof",
          type: "bytes",
        },
        {
          internalType: "bytes32",
          name: "Root",
          type: "bytes32",
        },
        {
          internalType: "bytes32",
          name: "NullifierHash",
          type: "bytes32",
        },
        {
          internalType: "address payable",
          name: "Recipient",
          type: "address",
        },
        {
          internalType: "address payable",
          name: "Relayer",
          type: "address",
        },
      ],
      name: "USERWithdrawal",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "Variable",
          type: "string",
        },
      ],
      name: "UpdateData",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "ZERO_VALUE",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "currentRootIndex",
      outputs: [
        {
          internalType: "uint32",
          name: "",
          type: "uint32",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "filledSubtrees",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getLastRoot",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "contract IHasher",
          name: "_hasher",
          type: "address",
        },
        {
          internalType: "bytes32",
          name: "_left",
          type: "bytes32",
        },
        {
          internalType: "bytes32",
          name: "_right",
          type: "bytes32",
        },
      ],
      name: "hashLeftRight",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32",
        },
      ],
      stateMutability: "pure",
      type: "function",
    },
    {
      inputs: [],
      name: "hasher",
      outputs: [
        {
          internalType: "contract IHasher",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_root",
          type: "bytes32",
        },
      ],
      name: "isKnownRoot",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "levels",
      outputs: [
        {
          internalType: "uint32",
          name: "",
          type: "uint32",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "merkle",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "nextIndex",
      outputs: [
        {
          internalType: "uint32",
          name: "",
          type: "uint32",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "roots",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "verifier",
      outputs: [
        {
          internalType: "contract IVerifier",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "i",
          type: "uint256",
        },
      ],
      name: "zeros",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32",
        },
      ],
      stateMutability: "pure",
      type: "function",
    },
  ],
  bytecode: "0x",
  deployedBytecode: "0x",
  linkReferences: {},
  deployedLinkReferences: {},
};
