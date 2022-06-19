import { AnyInterface, PropertyValues } from "../deps.ts";
import { Connection } from "../mod.ts";
import { Graph } from "../mod.ts";
import { BlockNode } from "./block-node.ts";

export class FlowRunner {
  #triggerID = 0;
  #nodes = new Map<string, BlockNode>();

  //readonly root: BlockNode;

  get nodes() {
    return this.#nodes;
  }

  get triggerID() { return this.#triggerID }

  #buildNetwork(flow: Graph) {
    // reset
    this.#resetNetwork();

    // create a BlockNode for each Node
    for (const [nodeID, node] of flow.nodes.entries()) {
      const blockNode = new BlockNode(nodeID, node);

      this.#nodes.set(nodeID, blockNode);
    }

    // Wire up links
    for (const [key, blockNode] of this.#nodes.entries()) {
      for (const [portID, port] of blockNode.node.ports.entries()) {
        for (const link of port.links) {
          const targetNode = this.#nodes.get(link.nodeID);

          if (targetNode) {
            const con: Connection = new Connection(port, link, targetNode);

            blockNode.addOutputConnection(portID, con);
          }
        }
      }

      this.#nodes.set(key, blockNode);
    }
  }

  #resetNetwork() {
    for (const [_id, blockNode] of this.#nodes) {
      blockNode.finalize();
    }

    this.#nodes.clear();
  }

  #findReadyLinkedNode(sourceNode: BlockNode): BlockNode | null {
    for (const [portID, _port] of sourceNode.node.ports) {
      const cons = sourceNode.getOutputConnections(portID);

      for (const con of cons) {
        const targetNode = con.targetNode;

        if (!this.hasTriggered(targetNode)) {
          if (targetNode.context.canTrigger(this.#triggerID)) {
            return targetNode;
          }
        }
      }
    }

    return null;
  }

  /**
   * 
   */
  constructor(public readonly flow: Graph) {
    //this.root = new BlockNode(flow);
  }

  setupNetwork() {
    this.#buildNetwork(this.flow);

    this.#triggeredNodes = [];

    const nodes = Array.from(this.#nodes.values());

    return Promise.all(nodes.map((bn) => {
      return bn.loadBlock()
        .catch(e => {
          console.log("error loading block", e, bn.id, bn.node.block)
        });
    }
    ));
  }

  teardownNetwork() {
    this.#resetNetwork();
  }

  nextTriggerID(): number {
    this.#triggerID++;
    this.#triggeredNodes = [];

    return this.#triggerID;
  }

  #triggeredNodes: BlockNode[] = [];
  hasTriggered(node: BlockNode) {
    return this.#triggeredNodes.includes(node);
  }

  nextReadyNode(allowRetriggers = false): BlockNode | undefined {
    // tail-end already triggered nodes
    for (let index = this.#triggeredNodes.length; index > 0; --index) {
      const node = this.#findReadyLinkedNode(this.#triggeredNodes[index - 1]);

      if (node) {
        return node;
      }
    }

    for (const [_nodeID, node] of this.#nodes) {
      if (node.context.canTrigger(this.#triggerID))
        return node;
    }

    if (allowRetriggers) {
      for (const [_nodeID, node] of this.#nodes) {
        if (node.context.blockHelper.inputsChanged && node.context.canTrigger())
          return node;
      }
    }

    // nobody is ready
    return undefined;
  }

  //triggerNode(node: BlockNode): Promise<BlockNode>;
   triggerNode(node?: BlockNode): Promise<BlockNode> | null {
    const selectedNode = node ?? this.nextReadyNode();

    if (selectedNode) {
      // will not execute again for same "triggerID"
      this.#triggeredNodes.push(selectedNode);

      return selectedNode.context.trigger(this.#triggerID).then((output) => {
        if (output instanceof Object) {
          for (const [portID, _port] of selectedNode.node.ports) {
            const cons = selectedNode.getOutputConnections(portID);

            for (const con of cons) {
              const targetNode = con.targetNode;

              const values = { [con.link.portID]: output[portID as keyof PropertyValues<AnyInterface>] };

              targetNode.context.blockHelper.inputs = values;
            }
          }
        }

        return selectedNode;
      });
    }

    // no node
    return null;
  }
}
