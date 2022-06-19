import { BlockContext } from "./block-context.ts";
import { Node, LinkInit, PortInit, Block } from "../mod.ts";
import { AnyInterface, AnyObject, PropertyValues } from "../deps.ts";
import { AbstractBlock } from "./abstract-block.ts";

/**
 * Runtime node.
 * 
 * Contains a node, a block-instance "context" and a map of output connections to other 
 * runtime-nodes, allowing data propagation after node triggering.
 * 
 * Allows lazy-loading of block instance, 
 * 
 * 
 */
export class NodeRunner<IF = AnyObject, BLK extends Block<IF> = AbstractBlock<IF>&IF> {
  #blockContext?: BlockContext<BLK>;
  #outputConnections = new Map<string, Connection[]>();
  #loading: Promise<void> | null;

  constructor(public readonly id: string, public node: Node) {
    this.#loading = BlockContext.fromNode<BLK>(node)
      .then((bc) => {
        // check if loading still required, since node may have been finalized
        if (this.#loading) {
          this.#blockContext = bc;
          this.#loading = null;
        }
      });
  }

  load(): Promise<unknown> {
    return this.#loading ?? Promise.resolve();
  }

  finalize() {
    this.#loading = null;

    this.#blockContext?.teardown();
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

  async trigger(triggerID: number) {
    const output = await this.context.trigger(triggerID);

    if (output instanceof Object) {
      for (const [portID, _port] of this.node.ports) {
        const cons = this.getOutputConnections(portID);

        for (const con of cons) {
          const targetNode = con.targetNode;

          const values = { [con.link.portID]: output[portID as keyof PropertyValues<AnyInterface>] };

          targetNode.context.blockHelper.inputs = values;
        }
      }
    }

    return this;
  }
}

export class Connection {
  constructor(
    public port: PortInit,
    public link: LinkInit,
    public targetNode: NodeRunner
  ) {
    // ...
  }
}
