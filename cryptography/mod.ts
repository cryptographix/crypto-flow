import { IFBlockCipher } from "./interfaces/block-cipher.ts";
import { CBCBlockCipherMode } from "./block-ciphers/block-cipher-modes/cbc-cipher-mode.ts";
import { AESBlockCipher } from './block-ciphers/aes-block-cipher.ts'
import { DESBlockCipher } from "./block-ciphers/des-block-cipher.ts";
import { PackageDefinition } from "./deps.ts";

export * from "./interfaces/block-cipher.ts";
export * from "./interfaces/cryptographic-hash.ts";

export * from "./interfaces/secure-random.ts";
export * from "./interfaces/padding-mode.ts";
export * from "./interfaces/signature-algorithm.ts";

export * from "./block-ciphers/aes-block-cipher.ts";
export * from "./block-ciphers/des-block-cipher.ts";
export * from "./block-ciphers/block-cipher-modes/cbc-cipher-mode.ts";

export * from "./cryptographic-hashes/sha1-hash.ts";

export const packageDefinition: PackageDefinition = {
  "namespace": "org.cryptographix.cryptography",

  packages: {
    "base": {
      interfaces: {
        "IFBlockCipher": IFBlockCipher,
      },
      blocks: {
        [CBCBlockCipherMode.name]: CBCBlockCipherMode,
      }
    },
    "block-ciphers": {
      blocks: {
        [AESBlockCipher.name]: AESBlockCipher,
        [DESBlockCipher.name]: DESBlockCipher,
      }
    }
  }
};

// import {BR}  from './deps.ts';

// const p = BR.mergePackage(packageInfo);

// console.log(p)

// console.log(JSON.stringify(BR.toObject(), null, 2 ))
