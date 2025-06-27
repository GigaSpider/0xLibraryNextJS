import { NextApiResponse, NextApiRequest } from "next";
import {
  Contract,
  Interface,
  JsonRpcProvider,
  hexlify,
  zeroPadValue,
  toBeArray,
} from "ethers";
import { MerkleTree } from "fixed-merkle-tree";
import { buildMimcSponge } from "circomlibjs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { chainId, contract_address, commitment } = req.body;

  let provider;

  switch (chainId) {
    case 11155111:
      provider = new JsonRpcProvider(process.env.SEPOLIA_URI);
      break;
    case 10:
      provider = new JsonRpcProvider(process.env.OPTIMISM_URI);
      break;
    default:
      return res.status(400).json({ error: "invalid network" });
  }

  const contract: Contract = new Contract(
    contract_address,
    ETHZK.abi,
    provider,
    // currently set to Sepolia
  );

  console.log("Checkpoint, parsing logs from contract: ", {
    contract_address,
  });

  const mimcSponge = await buildMimcSponge();
  const mimcHasher = (
    left: string | number | bigint,
    right: string | number | bigint,
  ) => {
    return mimcSponge.F.toString(
      mimcSponge.multiHash([BigInt(left), BigInt(right)]),
    );
  };

  try {
    const event_logs = await contract.queryFilter("DepositEvent");

    const contract_interface: Interface = contract.interface;

    console.log(contract_interface);

    const parsed_logs = event_logs.map((log) => {
      const parsed_log = contract_interface.parseLog(log);
      if (parsed_log) {
        return {
          ...log,
          name: parsed_log.name,
          args: parsed_log.args,
        };
      } else {
        console.log(
          "Error getting merkle tree data, no deposits detected on the contract",
        );
        return res.status(400).json({
          error:
            "Error getting merkle tree data, no deposits detected on the contract",
        });
      }
    });

    console.log("parsed_logs", parsed_logs);

    const leaves = parsed_logs
      .sort((a, b) => Number(a!.args.leafIndex) - Number(b!.args.leafIndex))
      .map((event) => event!.args.commitment);

    console.log("leaves", leaves);

    const depositEvent = parsed_logs.find(
      (e) =>
        e!.args.commitment ===
        hexlify(zeroPadValue(toBeArray(BigInt(commitment)), 32)),
    );

    console.log("depositEvent", depositEvent);

    const tree = new MerkleTree(20, leaves, {
      hashFunction: mimcHasher,
      zeroElement:
        "21663839004416932945382355908790599225266501822907911457504978515578255421292",
    });

    const leafIndex: number = depositEvent ? Number(depositEvent.args[1]) : -1;

    if (leafIndex == -1) {
      return res
        .status(400)
        .json({ error: "Public key not found in Merkle Tree" });
    }

    console.log({ leafIndex });

    const { pathElements, pathIndices } = tree.path(leafIndex);
    const treelen = tree.elements.length;
    const root = tree.root;

    console.log({
      tree,
      treelen,
      pathElements,
      pathIndices,
      root,
    });

    const rootBytes = hexlify(zeroPadValue(toBeArray(BigInt(root)), 32));

    const rootIndex = await contract.currentRootIndex();
    const lastRoot = await contract.getLastRoot();
    const rootCheck = await contract.isKnownRoot(rootBytes);
    const zeroRoot = await contract.roots(0);

    console.log({ rootIndex, lastRoot, rootCheck, rootBytes, zeroRoot });

    return res.status(200).json({ root, pathElements, pathIndices });
  } catch (error) {
    return res.status(400).json({ error });
  }
}

const ETHZK = {
  _format: "hh-sol-artifact-1",
  contractName: "ETHZK",
  sourceName: "contracts/zk/ETHZK.sol",
  abi: [
    {
      inputs: [
        {
          internalType: "contract IVerifier",
          name: "_verifier",
          type: "address",
        },
        {
          internalType: "contract IHasher",
          name: "_hasher",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "_denomination",
          type: "uint256",
        },
        {
          internalType: "uint32",
          name: "_merkleTreeHeight",
          type: "uint32",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
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
          internalType: "bytes",
          name: "Proof",
          type: "bytes",
        },
        {
          internalType: "address",
          name: "Destination",
          type: "address",
        },
      ],
      name: "RelayerWithdraw",
      outputs: [],
      stateMutability: "nonpayable",
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
      ],
      name: "USERWithdraw",
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
};
