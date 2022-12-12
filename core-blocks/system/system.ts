import { Block, BlockDefinition } from "../deps.ts";

class NullBlock implements Block {
  run(): void {
  }
}

export const FlowBlockDef: BlockDefinition<NullBlock> = {
  type: "flow",
  ctor: NullBlock,
  name: "Flow",
  category: "system",

  properties: {}
};
export const CodeBlockDef: BlockDefinition<NullBlock> = {
  type: "code",
  ctor: NullBlock,
  name: "Code",
  category: "system",

  properties: {}
};


