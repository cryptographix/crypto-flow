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

  #buildNetwork(flow: Graph) {
    // restart
    this.#nodes.clear();

    // create a BlockNode for each Node
    flow.nodes.forEach((node, key) => {
      const blockNode = new BlockNode(node);

      this.#nodes.set(key, blockNode);
    });

    // Wire up links
    this.#nodes.forEach((blockNode, key) => {
      blockNode.node.ports.forEach((port, portID) => {
        port.links.forEach((link) => {
          const targetNode = this.#nodes.get(link.nodeID);

          if (targetNode) {
            const con: Connection = new Connection(port, link, targetNode);

            blockNode.addOutputConnection(portID, con);
          }
        });
      });

      this.#nodes.set(key, blockNode);
    });
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

    return Promise.all(nodes.map((bn) => bn.loadBlock()));
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

  nextReadyNode(): BlockNode | undefined {
    // tail-end already triggered nodes
    for (let index = this.#triggeredNodes.length; index > 0; --index) {
      const node = this.#findReadyLinkedNode(this.#triggeredNodes[index - 1]);

      if (node) {
        return node;
      }
    }

    for (const [_nodeID, node] of this.#nodes) {
      if (node.context.canTrigger(this.#triggerID)) return node;
    }

    // nobody is ready
    return undefined;
  }

  triggerNode(node?: BlockNode): null | Promise<BlockNode> {
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

              const values = { [con.link.portID]: output[con.port.id as keyof PropertyValues<AnyInterface>] };

              targetNode.context.setInputs(values);
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
