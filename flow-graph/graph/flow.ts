import { Node } from "./node.ts";
import { JSONObject } from "../deps.ts";
import { Port } from "./port.ts";

export interface Flow extends Node {
  type: "root" | "flow";

  // nodes within graph
  nodes: Map<string, Node>;
}

/**
 * Flow represents, at run-time, a flow-graph consisting of connected nodes.
 */
export const Flow = {
  parseGraph(obj: JSONObject): Flow {
    const nodes = new Map<string, Node>();
    
    for (const [nodeID, node] of Object.entries((obj.nodes as JSONObject[]) ?? {})) {
      nodes.set(nodeID, Node.parseNode(node));
    }

    return {
      ...Node.parseNode(obj),
      type: obj.type as "root"|"flow",
      nodes
    };
  },

  toObject(flow: Flow): JSONObject {
    const { type = "root", name } = flow;

    const nodes = Array.from(flow.nodes).reduce((nodes, [nodeID, node]) => {
      nodes[nodeID] = Node.toObject(node);

      return nodes;
    }, {} as JSONObject);

    const ports = Array.from(flow.ports).reduce((ports, [portID, port]) => {
      ports[portID] = Port.toObject(port);

      return ports;
    }, {} as JSONObject);

    return JSONObject.clean({
      type,
      name,
      nodes,
      ports,
    });
  },

  emptyFlow: Object.freeze({
    ...Node.emptyNode,
    nodes: new Map(),
  } as Flow),
}
