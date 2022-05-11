import { BlockContext } from "../block/block-context.ts";
import { BlockLoader } from "../block/block-loader.ts";
import { INode } from "../graph/node.ts";

export type NodeStatus =
  | "initialized"
  | "setup"
  | "waiting"
  | "ready"
  | "busy"
  | "done"
  | "shutdown";

export class BlockNode {
  #loader: BlockLoader;
  #status: NodeStatus;
  #blockContext?: BlockContext;

  constructor(public node: INode, loader: BlockLoader) {
    this.#status = "initialized";

    this.#loader = loader;
  }

  get status() {
    return this.#status;
  }

  async loadBlock(): Promise<void> {
    switch (this.node.type) {
      case "block": {
        this.#blockContext = await BlockContext.fromLoader(this.#loader, this.node.block!.name as string );

        break;
      }

      case "code": {
        this.#blockContext = BlockContext.fromCode(
          this.node.block!.code as string
        );

        break;
      }

      case "input": {
        // noop
        break;
      }
      case "output": {
        // noop
        break;
      }
      default: {
        // noop
        break;
      }
    }

    // this.node.type
    return Promise.resolve();
  }
}
