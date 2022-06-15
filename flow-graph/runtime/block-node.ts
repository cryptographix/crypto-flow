import { BlockContext } from "./block-context.ts";
import { Node, LinkInit, PortInit, Block } from "../mod.ts";
import { AnyObject } from "../deps.ts";
import { AbstractBlock } from "./abstract-block.ts";

/**
 * Placeholder object for lazy loading
 */
export class BlockNode<IF = AnyObject, BLK extends Block<IF> = AbstractBlock<IF>> {
  #blockContext?: BlockContext<BLK>;
  #outputConnections = new Map<string, Connection[]>();
  #loading: Promise<unknown> | null;

  constructor(public readonly id: string, public node: Node) {
    this.#loading = BlockContext.fromNode<BLK>(node)
      .then((bc) => {
        // check if still loading, may have been finalized()
        if (this.#loading) {
          this.#blockContext = bc;
          this.#loading = null;
        }
      });
  }

  loadBlock(): Promise<unknown> {
    return this.#loading ?? Promise.resolve();
  }

  finalize() {
    this.#loading = null;
    this.#blockContext = undefined;
    this.#outputConnections.clear();
  }

  get context(): BlockContext<BLK> {
    if (this.#loading !== null)
      throw new Error("eka");

    return this.#blockContext!;
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
}

export class Connection {
  constructor(
    public port: PortInit,
    public link: LinkInit,
    public targetNode: BlockNode
  ) { }
}
