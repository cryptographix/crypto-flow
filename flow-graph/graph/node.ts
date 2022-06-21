import { JSONObject, JSONValue } from "../deps.ts";
import { Graph } from "./graph.ts";
import { Port, PortInit } from "./port.ts";

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

  // width
  w?: number;

  // height
  h?: number;

  // rotation, 0/90/180/-90/270
  r?: number;

  //
  color?: string;
}

export interface NodeBlockInfo {
  // namespaced block-name, aka blockID
  name?: string,

  // for "code" types, 
  code?: string;
}

export interface NodeInit<Port extends PortInit = PortInit> {
  type: NodeType;

  name?: string;

  ports: Map<string, Port>;

  block?: NodeBlockInfo;

  view?: NodeViewInfo;
}

export class Node {
  type: NodeType;

  name?: string;

  block: NodeBlockInfo;

  view: NodeViewInfo;

  ports: Map<string, Port>;

  constructor(public graph: Graph | null, node: NodeInit = Node.emptyNode) {
    const { type, name, block = {}, ports, view = {} } = node;

    this.type = type;
    this.name = name;
    this.block = block;
    this.view = view;

    this.ports = new Map(
      Object.entries(ports).map(([_portID, port]) => [
        _portID,
        new Port(this, port),
      ])
    );
  }

  static parseViewInfo(value: JSONValue): NodeViewInfo {
    const view = JSONValue.asObject<NodeViewInfo>(value, {});

    view.x = Math.round(view.x ?? 0);
    view.y = Math.round(view.y ?? 0);
    return view;
  }

  static parseBlockInfo(value: JSONValue): NodeBlockInfo {
    return JSONValue.asObject<NodeBlockInfo>(value, {});
  }

  static parseNode(graph: Graph | null, obj: JSONObject): Node {
    const { type, name, view, block } = obj;

    const node = new Node(graph, {
      type: JSONValue.asString(type) as NodeType,
      name: JSONValue.asString(name),
      block: Node.parseBlockInfo(block),
      view: Node.parseViewInfo(view),
      ports: new Map<string, Port>(),
    });

    for (const [portID, port] of Object.entries((obj.ports as JSONObject[]) ?? {})) {
      node.ports.set(portID, Port.parsePort(node, port));
    }

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
      view: JSONObject.clean({ ...view }),
      ports
    });
  }

  static readonly emptyNode: NodeInit = Object.freeze({
    type: "none",
    id: "",
    ports: new Map(),
  });
}
