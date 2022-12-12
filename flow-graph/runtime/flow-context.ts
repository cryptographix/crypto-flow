import { Connection, Node } from "../mod.ts";
import { Flow } from "../mod.ts";
import { NodeContext } from "./node-context.ts";

export class FlowContext extends NodeContext {
  #triggerID = 0;

  #nodes = new Map<string, NodeContext>();

  #buildNetwork(flow: Flow) {
    // reset
    this.#resetNetwork();

    // create a BlockNode for each Node
    for (const [nodeID, node] of flow.nodes.entries()) {
      const blockNode = new NodeContext(nodeID, node);

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

  #findReadyLinkedNode(sourceNode: NodeContext): NodeContext | null {
    for (const [portID, _port] of sourceNode.node.ports) {
      const cons = sourceNode.getOutputConnectionsForPort(portID);

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
  constructor(public flowID: string, public readonly flow: Flow) {
    super(flowID, flow as Node);
  }

  get nodes() { return this.#nodes; }
  get triggerID() { return this.#triggerID }

  setupNetwork() {
    this.#buildNetwork(this.flow);

    this.#triggeredNodes = [];

    const nodes = Array.from(this.#nodes.values());

    return Promise.all(nodes.map((bn) => {
      return bn.load()
        .catch(e => {
          console.log("error loading block", e, bn.nodeID, bn.node.block)
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

  #triggeredNodes: NodeContext[] = [];
  hasTriggered(node: NodeContext) {
    return this.#triggeredNodes.includes(node);
  }

  nextReadyNode(allowRetriggers = false): NodeContext | undefined {
    function choose(n1: NodeContext, n2?: NodeContext) {
      if (n2 == undefined)
        return n1;

      if ((n1.node.view.pos.x ?? 0) < (n2.node.view.pos.x ?? 0)) 
        return n1;

      if ((n1.node.view.pos.x ?? 0) > (n2.node.view.pos.x ?? 0)) 
        return n2;

      return ((n1.node.view.pos.y ?? 0) < (n2.node.view.pos.y ?? 0)) ? n1 : n2;
    }

    let ready: NodeContext | undefined = undefined;

    for (const [_nodeID, node] of this.#nodes) {
      const hasIn = Array.from(node.node.ports.entries()).filter(([_portID, port]) => port.direction == "in");
      if (hasIn.length == 0) {
        if (node.context.canTrigger(this.#triggerID))
          ready = choose(node, ready);
      }
    }

    if (!ready) {
      // tail-end already triggered nodes
      for (let index = this.#triggeredNodes.length; index > 0; --index) {
        const node = this.#findReadyLinkedNode(this.#triggeredNodes[index - 1]);

        if (node) {
          ready = choose(node, ready);
        }
      }
    }

    if (!ready) {
      for (const [_nodeID, node] of this.#nodes) {
        if (node.context.canTrigger(this.#triggerID))
          ready = choose(node, ready);
      }
    }

    if (!ready && allowRetriggers) {
      for (const [_nodeID, node] of this.#nodes) {
        if (node.context.blockHelper.inputsChanged && node.context.canTrigger())
        ready = choose(node, ready);
      }
    }

    return ready;
  }

  //triggerNode(node: BlockNode): Promise<BlockNode>;
  triggerNode(node?: NodeContext): Promise<NodeContext> | null {
    const selectedNode = node ?? this.nextReadyNode();

    if (selectedNode) {
      // will not execute again for same "triggerID"
      this.#triggeredNodes.push(selectedNode);

      return selectedNode.trigger(this.#triggerID);
    }

    // no node
    return null;
  }
}
