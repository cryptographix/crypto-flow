import { BlockContext } from "../block/block-context.ts";
import { BlockLoader } from "../block/block-loader.ts";
import { INode } from "../graph/node.ts";
import { ILink, IPort } from "../mod.ts";

export type NodeStatus =
  | "initialized"
  | "setup"
  | "waiting"
  | "ready"
  | "busy"
  | "done"
  | "shutdown";

export class BlockNode {
  #loader?: BlockLoader;
  #status: NodeStatus;
  #blockContext?: BlockContext;
  #outputConnections = new Map<string, Connection[]>();

  constructor(public node: INode, loader?: BlockLoader) {
    this.#status = "initialized";

    this.#loader = loader;
  }

  get status() {
    return this.#status;
  }

  get context(): BlockContext {
    if (!this.#blockContext) throw new Error("eka");
    return this.#blockContext;
  }

  getOutputConnections(portID: string): Connection[] {
    return this.#outputConnections.get(portID) ?? [];
  }

  addOutputConnection(portID: string, connection: Connection) {
    const cons = this.#outputConnections.get(portID) ?? [];

    cons.push(connection);

    if (!this.#outputConnections.has(portID)) {
      this.#outputConnections.set(portID, cons);
    }
  }

  async loadBlock(): Promise<void> {
    switch (this.node.type) {
      case "block": {
        if (this.#loader) {
          this.#blockContext = await BlockContext.fromLoader(
            this.#loader,
            this.node.block!.name as string
          );
        } else {
          throw new Error("No loader");
        }
        break;
      }

      case "code": {
        this.#blockContext = await BlockContext.fromCode(this.node);
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
        // TODO: error
        break;
      }
    }

    this.#status = "setup";
  }
}

export class Connection {
  constructor(
    public port: IPort,
    public link: ILink,
    public targetNode: BlockNode
  ) {}
}
