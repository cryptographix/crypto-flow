import { BlockContext } from "./block-context.ts";
import { BlockLoader } from "../block/block-loader.ts";
import { INode } from "../graph/node.ts";
import { Block, ILink, IPort } from "../mod.ts";
import { AnyObject } from "../deps.ts";

/**
 * Placeholder object for lazy loading
 */
export class BlockNode<IF = AnyObject, BLK extends Block<IF>= Block<IF>> {
  #loader?: BlockLoader;
  #blockContext?: BlockContext<BLK>;
  #outputConnections = new Map<string, Connection[]>();

  readonly id: string;

  constructor(public node: INode, loader?: BlockLoader) {
    this.id = node.id;
    this.#loader = loader;
  }

  get context(): BlockContext<BLK> {
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
          this.#blockContext = (await BlockContext.fromLoader(
            this.#loader,
            this.node.block!.name as string
          )) as unknown as BlockContext<BLK>;
        } else {
          throw new Error("No loader");
        }
        break;
      }

      case "code": {
        this.#blockContext = (await BlockContext.fromCode(
          this.node
        )) as unknown as BlockContext<BLK>;
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
  }
}

export class Connection {
  constructor(
    public port: IPort,
    public link: ILink,
    public targetNode: BlockNode
  ) {}
}
