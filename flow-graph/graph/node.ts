import { JSONObject, JSONValue } from "../deps.ts";
import { Port } from "./port.ts";

export type NodeType =
  | "root"
  | "flow"
  | "block"
  | "code"
;

export interface NodeViewInfo {
  pos: {
    // x-offset, relative to enclosing flow
    x: number;

    // y-offset, relative to enclosing flow
    y: number;
  },

  size: {
    // width
    x: number;

    // height
    y: number;
  },

  // rotation, 0/90/180/-90/270
  r?: number;

  //
  color?: string;
}

export const NodeViewInfo = {
  get zero(): NodeViewInfo {
    // clone
    return {
      pos: { ...{ x: 0, y: 0 } },
      size: { ...{ x: 0, y: 0 } },
    }
  },

  parseViewInfo(value: JSONValue): NodeViewInfo {
    const view = JSONValue.asObject<JSONObject>(value, {});

    return {
      pos: {
        x: Math.round(JSONValue.asNumber(view.x, 0)),
        y: Math.round(JSONValue.asNumber(view.y, 0)),
      },
      size: {
        x: Math.round(JSONValue.asNumber(view.w, 0)),
        y: Math.round(JSONValue.asNumber(view.h, 0)),
      },
      r: JSONValue.asNumber(view.r, 0),
      color: JSONValue.asString(view.color, ""),
    };
  },

  viewInfoToObject(view: NodeViewInfo): JSONObject {
    const obj = JSONObject.clean({
      x: view.pos.x,
      y: view.pos.y,
      w: view.size.x,
      h: view.size.y,
      r: view.r,
      color: view.color,
    });

    if (obj.x != 0 || obj.y != 0 || obj.w != 0 || obj.h != 0 || obj.r != 0 || obj.color == "")
      return obj;
    else
      return {};
  },

}

export interface NodeBlockInfo {
  // [type="block"]: namespaced block-name, aka blockID
  name?: string,

  // [type="code"]: js function to execute 
  code?: string;

  // [type="flow"]: flow ID within project
  flowID?: string;

  // [type="flow"]: inline flow 
  //flow?: GraphInit;
}

export interface Node {
  type: NodeType;

  name?: string;

  ports: Map<string, Port>;

  block: NodeBlockInfo;

  view: NodeViewInfo;
}

export const Node = {
  parseBlockInfo(value: JSONValue): NodeBlockInfo {
    return JSONValue.asObject<NodeBlockInfo>(value, {});
  },

  parseNode(obj: JSONObject): Node {
    const { type, name, view, block } = obj;

    const node = {
      type: JSONValue.asString(type) as NodeType,
      name: JSONValue.asString(name),
      block: Node.parseBlockInfo(block),
      view: NodeViewInfo.parseViewInfo(view),
      ports: new Map<string, Port>(),
    };

    for (const [portID, port] of Object.entries((obj.ports as JSONObject[]) ?? {})) {
      node.ports.set(portID, Port.parsePort(port));
    }

    return node;
  },

  toObject(node: Node): JSONObject {
    const { type, name, block, view, ports } = node;

    const portsObj = Array.from(ports).reduce((ports, [portID, port]) => {
      ports[portID] = Port.toObject(port);

      return ports;
    }, {} as JSONObject);

    return JSONObject.clean({
      type,
      name,
      block: JSONObject.clean({ ...block }),
      view: view && NodeViewInfo.viewInfoToObject(view),
      ports: portsObj
    });
  },

  emptyNode: Object.freeze({
    type: "flow",
    id: "",
    ports: new Map(),
    view: {} as NodeViewInfo,
    block: {} as NodeBlockInfo,
  } as Node),
}
