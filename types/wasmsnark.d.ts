declare module "wasmsnark" {
  // Define types for the exported functions
  export const buildF1: typeof import("./src/f1.js");
  export const buildBn128: typeof import("./src/bn128.js");
  export const buildMnt6753: typeof import("./src/mnt6753.js");
}
