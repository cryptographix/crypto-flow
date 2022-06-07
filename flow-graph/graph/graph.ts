import { Node, NodeInfo } from "./node.ts";
import { Port, PortInfo } from "./port.ts";
import { JSONObject } from "../deps.ts";
import { IProject } from "../project/project.ts";

export interface GraphInfo<Node extends NodeInfo = NodeInfo, Port extends PortInfo = PortInfo>
  extends NodeInfo<Port> {
  nodes: Map<string, Node>;
}

/**
 * Flow represents, at run-time, a flow-graph consisting of connected nodes.
 */
export class Graph extends Node implements GraphInfo<Node, Port> {
  nodes: Map<string, Node>;

  constructor(private project: IProject|undefined=undefined, graph: GraphInfo = Graph.emptyGraph) {
    super(null, graph);

    const { nodes } = graph;

    this.nodes = new Map(
      Object.entries(nodes).map(([nodeID, node]) => [nodeID, new Node(node)])
    );
  }

  static parseGraph(project: IProject|undefined, id: string, obj: JSONObject): Graph {
    const graph = new Graph(project, {
      ...Node.parseNode(null, id, obj),
      nodes: new Map<string, Node>(),
    });

    Object.entries((obj.nodes as JSONObject[]) ?? {}).reduce((nodes, item) => {
      const [nodeID, node] = item;

      nodes.set(nodeID, Node.parseNode(graph, nodeID, node));

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

  static readonly emptyGraph: GraphInfo = {
    ...Node.emptyNode,
    nodes: new Map(),
  };
}
