import { InterfaceDefinition } from "../deps.ts";

export interface IFByteArrayBinaryOperator {
  op1: Uint8Array;
  op2: Uint8Array;
  result: Uint8Array;
}

export const IFByteArrayBinaryOperator: InterfaceDefinition = {
  name: "IFByteArrayBinaryOperator",

  propertyDefinitions: {
    op1: {
      dataType: "u8[]",
      accessors: "set"
    },
    op2: {
      dataType: "u8[]",
      accessors: "set"
    },
    result: {
      dataType: "u8[]",
      accessors: "get"
    },
  }
}
