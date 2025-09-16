// src/types/cbor-js.d.ts
declare module "cbor-js" {
  export function decode(input: ArrayBuffer | Uint8Array): any;
  export function encode(input: any): ArrayBuffer;
}
