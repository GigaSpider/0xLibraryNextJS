declare module "ffjavascript" {
  export namespace utils {
    function leBuff2int(buff: Buffer): bigint;
    function leInt2Buff(int: bigint, size?: number): Buffer;
  }
  export namespace Scalar {
    function fromString(str: string, radix?: number): bigint;
    function toString(n: bigint | number | string, radix?: number): string;
    function fromRprLE(buff: Uint8Array, o?: number, n?: number): bigint;
    function fromRprBE(buff: Uint8Array, o?: number, n?: number): bigint;
    function toRprLE(buff: Uint8Array, o: number, n: number, v: bigint): void;
    function toRprBE(buff: Uint8Array, o: number, n: number, v: bigint): void;
    function add(a: bigint, b: bigint): bigint;
    function sub(a: bigint, b: bigint): bigint;
    function neg(a: bigint): bigint;
    function mul(a: bigint, b: bigint): bigint;
    function square(a: bigint): bigint;
    function pow(a: bigint, b: bigint): bigint;
    function exp(a: bigint, b: bigint, n: bigint): bigint;
    function shr(a: bigint, b: number): bigint;
    function shl(a: bigint, b: number): bigint;
    function mod(a: bigint, b: bigint): bigint;
    function eq(a: bigint, b: bigint): boolean;
    function neq(a: bigint, b: bigint): boolean;
    function lt(a: bigint, b: bigint): boolean;
    function gt(a: bigint, b: bigint): boolean;
    function leq(a: bigint, b: bigint): boolean;
    function geq(a: bigint, b: bigint): boolean;
    function band(a: bigint, b: bigint): bigint;
    function bor(a: bigint, b: bigint): bigint;
    function bxor(a: bigint, b: bigint): bigint;
    function land(a: boolean, b: boolean): boolean;
    function lor(a: boolean, b: boolean): boolean;
    function lnot(a: boolean): boolean;
    function sqrt(n: bigint): bigint;
    function isSquare(n: bigint): boolean;
  }
}
