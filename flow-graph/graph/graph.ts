import { Node, NodeInit } from "./node.ts";
import { PortInit } from "./port.ts";
import { JSONObject } from "../deps.ts";
import { ProjectInit } from "../project/project.ts";

export interface GraphInit<Node extends NodeInit = NodeInit, Port extends PortInit = PortInit>
  extends NodeInit<Port> {

  // nodes within graph
  nodes: Map<string, Node>;
}

/**
 * Flow represents, at run-time, a flow-graph consisting of connected nodes.
 */
export class Graph extends Node {
  nodes: Map<string, Node>;

  constructor(private project: ProjectInit|undefined=undefined, graph: GraphInit = Graph.emptyGraph) {
    super(null, graph);

    const { nodes } = graph;

    this.nodes = new Map(
      Object.entries(nodes).map(([nodeID, node]) => [nodeID, new Node(node)])
    );
  }

  static parseGraph(project: ProjectInit|undefined, obj: JSONObject): Graph {
    const graph = new Graph(project, {
      ...Node.parseNode(null, obj),
      nodes: new Map<string, Node>(),
    });

    Object.entries((obj.nodes as JSONObject[]) ?? {}).reduce((nodes, item) => {
      const [nodeID, node] = item;

      nodes.set(nodeID, Node.parseNode(graph, node));

      return nodes;
    }, graph.nodes);

    return graph;
  }

  toObject(): JSONObject {
    const { type = "root", name } = this;

    const nodes = Array.from(this.nodes).reduce((nodes, [nodeID, node]) => {
      nodes[nodeID] = node.toObject();

      return nodes;
    }, {} as JSONObject);

    const ports = Array.from(this.ports).reduce((ports, [portID, port]) => {
      ports[portID] = port.toObject();

      return ports;
    }, {} as JSONObject);

    return JSONObject.removeNullOrUndefined({
      type,
      name,
      nodes,
      ports,
    });
  }

  static readonly emptyGraph: GraphInit = {
    ...Node.emptyNode,
    nodes: new Map(),
  };
}
