import { JSONObject } from "../deps.ts";
import { Graph } from "./graph.ts";
import { Port, IPort } from "./port.ts";

export type NodeType = "none" | "root" | "flow" | "block" | "code" | "flow" | "input" | "output";
export type NodeStatus =
  | "initialized"
  | "setup"
  | "waiting"
  | "ready"
  | "busy"
  | "done"
  | "shutdown";

export interface INode<Port extends IPort = IPort> {
  type: NodeType;

  nodeID: string;

  title: string;

  ports: Map<string, Port>;
}

export interface NodeFacade<N extends Node> {
  node: N;

  config: Record<string, unknown>;

  readonly inPorts: Map<string, Port>;

  readonly outPorts: Map<string, Port>;
}

export class Node implements INode<Port> {
  type: NodeType;

  nodeID: string;

  title: string;

  ports: Map<string, Port>;

  #status: NodeStatus;

  constructor(public flow: Graph, node: INode) {
    const { type, nodeID, title, ports } = node;

    this.type = type;
    this.nodeID = nodeID;
    this.title = title;

    this.ports = new Map(
      Object.entries(ports).map(([_portID, port]) => [
        _portID,
        new Port(this, port),
      ])
    );

    this.#status = "initialized";
  }

  get status() {
    return this.#status;
  }

  static parseNode(flow: Graph, nodeID: string, obj: JSONObject): Node {
    const { type, title = "" } = obj;

    const node = new Node(flow, {
      type: type as NodeType,
      nodeID,
      title: title as string,
      ports: new Map<string, Port>(),
    });

    Object.entries(obj.ports ?? {}).reduce((ports, item) => {
      const [id, port] = item;

      ports.set(id, Port.parsePort(node, id, port));

      return ports;
    }, node.ports);

    return node;
  }

  toObject(): JSONObject {
    const { nodeID, type, title = "" } = this;

    const ports = Array.from(this.ports).reduce( (ports, [portID, port]) => {
      ports[portID] =  port.toObject();
      
      return ports;
    }, {} as JSONObject);

    return {
      nodeID,
      type,
      title,
      ports,
    };
  }
}
