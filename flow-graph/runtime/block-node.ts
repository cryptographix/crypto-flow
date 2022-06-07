import { BlockContext } from "./block-context.ts";
import { Node, LinkInfo, PortInfo } from "../mod.ts";
import { AnyObject } from "../deps.ts";
import { AbstractBlock } from "./abstract-block.ts";

/**
 * Placeholder object for lazy loading
 */
export class BlockNode<IF = AnyObject, BLK extends AbstractBlock<IF> = AbstractBlock<IF>> {
  #blockContext?: BlockContext<BLK>;
  #outputConnections = new Map<string, Connection[]>();
  #loading: Promise<unknown> | null;

  readonly id: string;

  constructor(public node: Node) {
    this.id = node.id;

    this.#loading = BlockContext.fromNode<BLK>(node)
      .then((bc) => {
        this.#blockContext = bc;
        this.#loading = null;
      });
  }

  loadBlock(): Promise<unknown> {
    return this.#loading ?? Promise.resolve();
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
    public port: PortInfo,
    public link: LinkInfo,
    public targetNode: BlockNode
  ) { }
}
