import { buildBabyjub, buildPedersenHash } from "circomlibjs";
import { toBigInt } from "ethers";
import { utils } from "ffjavascript";

function buff2hex(data: Buffer | Uint8Array, length: number = 32) {
  // function i2hex(i) {
  //   return ("0x" + i.toString(16)).slice(-2);
  // }
  // return Array.from(buff).map(i2hex).join("");

  return (
    "0x" +
    (data instanceof Buffer
      ? data.toString("hex")
      : toBigInt(data).toString(16)
    ).padStart(length * 2, "0")
  );
}

// test("My Pedersen hash test", async function () {
//   const pedersen = await buildPedersenHash();
//   const jub = await buildBabyjub();
//   const random31ByteInteger = BigInt(
//     "344410142378928871436301712867274033804306130921771574934151126616008408896",
//   );

//   const expectedPedersenHashCalculatedByCircom = BigInt(
//     "19027137175049743803623751962941766172362255419566664209740033119765472965258",
//   );

//   const hash = jub.unpackPoint(
//     pedersen.hash(utils.leInt2Buff(random31ByteInteger, 31)),
//   )[0];

//   expect(utils.leBuff2int(hash)).toEqual(
//     expectedPedersenHashCalculatedByCircom,
//   );
// });

//example test from repository

// test("Example Test From Github Repo", async function () {
//   const pedersen = await buildPedersenHash();

//   const msg = new TextEncoder().encode("Hello");

//   const res2 = pedersen.hash(msg);

//   console.log(buff2hex(res2));

//   expect(buff2hex(res2)).toEqual(
//     "0e90d7d613ab8b5ea7f4f8bc537db6bb0fa2e5e97bbac1c1f609ef9e6a35fd8b",
//   );
// });

test("pedersenhash test", async function () {
  const pedersen = await buildPedersenHash();
  const jub = await buildBabyjub();

  const pedersenHash = (data: Buffer) =>
    jub.unpackPoint(pedersen.hash(data))[0];

  const nullifier = BigInt(
    "344410142378928871436301712867274033804306130921771574934151126616008408896",
  );

  const secret = BigInt(
    "53388718127289800018449053091626962393684120531648523656289837560003367174",
  );

  const preimage = Buffer.concat([
    utils.leInt2Buff(nullifier, 31),
    utils.leInt2Buff(secret, 31),
  ]);

  console.log("preimage: ", preimage);

  const preimageHex = buff2hex(preimage, 62);

  console.log("preimage hex", preimageHex);

  //step 1 make commitment

  const commitment = pedersenHash(preimage);

  console.log("commitment: ", commitment);

  //step 2 convert commitment to hex

  const commitmentHex = buff2hex(commitment);

  console.log("commitmentHex", commitmentHex);

  //step 3 buffer from decoded

  const buffFromPreimage = Buffer.from(preimageHex.slice(2), "hex");

  //step 4 little endian buffer to int

  const reconstructedNullifier = utils.leBuff2int(
    buffFromPreimage.subarray(0, 31),
  );
  const reconstructedSecret = utils.leBuff2int(
    buffFromPreimage.subarray(31, 62),
  );

  const reconstructedPreimage = Buffer.concat([
    utils.leInt2Buff(reconstructedNullifier, 31),
    utils.leInt2Buff(reconstructedSecret, 31),
  ]);

  const preimageInt = utils.leBuff2int(reconstructedPreimage);

  console.log({
    reconstructedNullifier,
    reconstructedSecret,
    reconstructedPreimage,
    preimageInt,
  });

  const nullifierHash = pedersenHash(
    utils.leInt2Buff(reconstructedNullifier, 31),
  );

  // expect(toBigInt(commitment)).toEqual(
  //   BigInt(
  //     "6629189984458537057648658375621136337889679937096612956162860812001410527554",
  //   ),
  // );

  //step 3 buffer from decoded

  //step 4 little endian buffer to int

  //step 5 little endian int to buff
});
