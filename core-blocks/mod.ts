import { IFByteArrayBinaryOperator} from './bytearray-ops/binary-operator-interface.ts'
import { XORBytes } from './bytearray-ops/xor.ts';
import { UnsignedWrappingADDBytes } from './bytearray-ops/add.ts';
import { ByteArray } from './data-in-out/bytearray.ts'

import { PackageDefinition } from "./deps.ts";

export const packageDefinition: PackageDefinition = {
  "namespace": "org.cryptographix.core",

  packages: {
    "byte-ops": {
      interfaces: {
        "IFByteArrayBinaryOperator": IFByteArrayBinaryOperator,
      },
      blocks: {
        "XORBytes": XORBytes,
        "ADDBytes": UnsignedWrappingADDBytes,
        "ByteArray": ByteArray,
      }
    },
  }
};
