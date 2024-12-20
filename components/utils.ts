export async function isMoneroAddress(address: string): Promise<boolean> {
  const validLength = address.length === 95 || address.length === 106;
  const validPrefix = address.startsWith("4") || address.startsWith("8");
  const base58Regex =
    /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
  const validCharacters = base58Regex.test(address);
  return validLength && validPrefix && validCharacters;
}
