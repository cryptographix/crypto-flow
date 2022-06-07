import { JSONObject, JSONValue } from "../deps.ts";
import { Graph } from "./graph.ts";
import { Port, PortInfo } from "./port.ts";

export type NodeType =
  | "none"
  | "root"
  | "flow"
  | "block"
  | "code"
  | "input"
  | "output";

export interface NodeViewInfo {
  // x-offset, relative to enclosing flow
  x?: number;

  // y-offset, relative to enclosing flow
  y?: number;

  w?: number;

  h?: number;

  color?: string;
}

export interface NodeBlockInfo {
  // namespaced block-name
  name?: string,

  // for "code" types, 
  code?: string;
}

export interface NodeInfo<Port extends PortInfo = PortInfo> {
  type: NodeType;

  id: string;

  name?: string;

  ports: Map<string, Port>;

  block?: NodeBlockInfo;

  view?: NodeViewInfo;
}

export class Node {
  type: NodeType;

  id: string;

  name?: string;

  block: NodeBlockInfo;

  ports: Map<string, Port>;

  view: NodeViewInfo;

  constructor(public graph: Graph | null, node: NodeInfo = Node.emptyNode) {
    const { type, id, name, block = {}, ports, view } = node;

    this.type = type;
    this.id = id;
    this.name = name;
    this.block = block;

    this.ports = new Map(
      Object.entries(ports).map(([_portID, port]) => [
        _portID,
        new Port(this, port),
      ])
    );

    this.view = view ?? { x: 0, y: 0, w: 0, h: 0, color: "white" };
  }

  static parseViewInfo(viewVal: JSONValue): NodeViewInfo {
    return JSONValue.asObject<NodeViewInfo>(viewVal, {});
  }

  static parseBlockInfo(blockVal: JSONValue): NodeBlockInfo {
    return JSONValue.asObject<NodeBlockInfo>(blockVal, {});
  }

  static parseNode(graph: Graph | null, id: string, obj: JSONObject): Node {
    const { type, name, view, block } = obj;

    const node = new Node(graph, {
      type: JSONValue.asString(type) as NodeType,
      id,
      block: Node.parseBlockInfo(block),
      name: JSONValue.asString(name),
      ports: new Map<string, Port>(),
      view: Node.parseViewInfo(view),
    });

    Object.entries((obj.ports as JSONObject[]) ?? {}).reduce((ports, item) => {
      const [id, port] = item;

      ports.set(id, Port.parsePort(node, id, port));

      return ports;
    }, node.ports);

    return node;
  }

  toObject(): JSONObject {
    const { type, name, block, view } = this;

    const ports = Array.from(this.ports).reduce((ports, [portID, port]) => {
      ports[portID] = port.toObject();

      return ports;
    }, {} as JSONObject);

    return JSONObject.clean({
      type,
      name,
      block: JSONObject.clean({ ...block }),
      ports,
      view: JSONObject.clean({ ...view }),
    });
  }

  static readonly emptyNode: NodeInfo = Object.freeze({
    type: "none",
    id: "",
    ports: new Map(),
  });
}
