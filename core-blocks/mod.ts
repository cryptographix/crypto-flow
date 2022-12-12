import { FlowBlockDef, CodeBlockDef } from './system/system.ts';
import { IFByteArrayBinaryOperator } from './bytearray-ops/binary-operator-interface.ts'
import XORBytes from './bytearray-ops/xor.ts';
import ADDBytes from './bytearray-ops/add.ts';
import ByteArray from './system/bytearray.ts'

import { PackageDefinition } from "./deps.ts";

export const packageDefinition: PackageDefinition = {
  "namespace": "org.cryptographix",

  packages: {
    "core.byte-ops": {
      interfaces: {
        "IFByteArrayBinaryOperator": IFByteArrayBinaryOperator,
      },
      blocks: {
        "XORBytes": XORBytes,
        "ADDBytes": ADDBytes,
      }
    },
    "system": {

      blocks: {
        "ByteArray": ByteArray,
        "Code": CodeBlockDef,
        "Flow": FlowBlockDef,
      },
    }
  }
};
