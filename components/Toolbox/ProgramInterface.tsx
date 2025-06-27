interface Tool {
  name: string;
  description: string;
}

const zkSecretGenerator: Tool = {
  name: "ZK Secret Generator",
  description: "ZK Keygen",
};

const zkProofGenerator: Tool = {
  name: "ZK Proof Generator",
  description: "ZK Prover",
};

const zkWithdrawalAgent: Tool = {
  name: "ZK Agent",
  description: "Withdraw Agent",
};

const EcDSAEncrypt = {
  name: "EcDSA Encrypt",
  description: "EcDSA Encrypt",
};

const EcDSADecrypt: Tool = {
  name: "EcDSA Decrypt",
  description: "EcDSA Decrypt",
};

export const Tools: Tool[] = [
  zkSecretGenerator,
  zkProofGenerator,
  zkWithdrawalAgent,
  EcDSAEncrypt,
  EcDSADecrypt,
];

// export default function ProgramInterface({ Program }: { Program: Program }) {}
