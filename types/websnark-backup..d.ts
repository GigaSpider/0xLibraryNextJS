declare module "websnark-backup" {
  export namespace utils {
    function toHex32(number: number) {
      let str = number.toString(16);
      while (str.length < 64) str = "0" + str;
      return str;
    }
    function genWitnessaAndProve(groth16, input, circuitJson, provingKey) {
      const witnessData = genWitness(input, circuitJson);
      const witnessBin = convertWitness(witnessData.witness);
      const result = await groth16.proof(witnessBin, provingKey);
      result.publicSignals = stringifyBigInts2(witnessData.publicSignals);
      return result;
    }
  }

  export namespace buildGroth16 {}
}
