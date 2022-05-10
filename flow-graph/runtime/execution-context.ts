import { Flow, Node } from "../mod.ts";

export class ExecutionContext {
  triggerID: number = 0;

  readonly busyNodes = new Map<string, Node>();
  readonly readyNodes = new Map<string, Node>();
  readonly waitingNodes = new Map<string, Node>();

  currentNode?: Node;

  constructor(public readonly flow: Flow) {
    this.#updateNodeMaps(flow);
  }

  #updateNodeMaps(flow: Flow) {
    this.waitingNodes.clear();
    this.readyNodes.clear();
    this.busyNodes.clear();

    flow.nodes.forEach((node, key) => {
      switch (node.status) {
        case "waiting":
          this.waitingNodes.set(key, node);
          break;

        case "ready":
          this.readyNodes.set(key, node);
          break;

        case "done":
        case "busy":
          this.busyNodes.set(key, node);
          break;

        case "initialized":
        case "shutdown":
        default:
          // ignore
          break;
      }
    });
  }
}
