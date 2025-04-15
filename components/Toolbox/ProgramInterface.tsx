interface Tool {
  name: string;
}

const zkProofGenerator: Tool = {
  name: "ZKProofGenerator",
};
const zkSecretGenerator: Tool = {
  name: "ZKSecretGenerator",
};

export const Tools: Tool[] = [zkProofGenerator, zkSecretGenerator];

export default function ProgramInterface({ Program }: { Program: Program }) {}
