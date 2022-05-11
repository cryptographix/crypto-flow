import { BlockLoader } from "../mod.ts";
import { Graph, Node } from "../mod.ts";
import { BlockNode } from "./block-node.ts";

export class FlowRunner {
  triggerID = 0;

  readonly nodes = new Map<string, BlockNode>();

  currentNode?: Node;

  constructor(public readonly flow: Graph) {}

  setupNetwork(loader: BlockLoader) {
    this.#setupNodeMaps(this.flow, loader);

    this.currentNode = undefined;

    const nodes = Array.from(this.nodes.values());

    return Promise.all(nodes.map((bn) => bn.loadBlock()));
  }

  #setupNodeMaps(flow: Graph, loader: BlockLoader) {
    this.nodes.clear();

    flow.nodes.forEach((node, key) => {
      const blockNode = new BlockNode(node, loader);

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
