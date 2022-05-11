import { Graph, Node } from "../mod.ts";
import { BlockNode } from "./block-node.ts";

export class FlowRunner {
  triggerID = 0;

  readonly nodes = new Map<string, BlockNode>();

  currentNode?: Node;

  constructor(public readonly flow: Graph) {
    this.#setupNodeMaps(flow);
  }

  #setupNodeMaps(flow: Graph) {
    this.nodes.clear();

    flow.nodes.forEach((node, key) => {
      const blockNode = new BlockNode( node );

      this.nodes.set(key, blockNode);
    });
  }
      
  /*#updateNodeMaps(flow: Graph) {
    this.waitingNodes.clear();
    this.readyNodes.clear();
    this.busyNodes.clear();

    flow.nodes.forEach((node, key) => {
      switch (node.status) {
        case "waiting":
          this.waitingNodes.set(key, blockNode);
          break;

        case "ready":
          this.readyNodes.set(key, blockNode);
          break;

        case "done":
        case "busy":
          this.busyNodes.set(key, blockNode);
          break;

        case "initialized":
        case "shutdown":
        default:
          // ignore
          break;
      }
    });
  }*/
}
