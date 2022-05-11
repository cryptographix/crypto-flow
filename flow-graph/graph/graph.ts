import { IProject } from "./project.ts";
import { Node, INode } from "./node.ts";
import { Port, IPort } from "./port.ts";
import { JSONObject } from "../deps.ts";

export interface IGraph<Node extends INode = INode, Port extends IPort = IPort>
  extends INode<Port> {
  nodes: Map<string, Node>;
}

/**
 * Flow represents, at run-time, a flow-graph consisting of connected nodes.
 */
export class Graph extends Node implements IGraph<Node, Port> {
  nodes: Map<string, Node>;

  constructor(public project: IProject, graph: IGraph) {
    super(graph);

    const { nodes } = graph;

    this.nodes = new Map(
      Object.entries(nodes).map(([nodeID, node]) => [nodeID, new Node(node)])
    );
  }

  static parseGraph(project: IProject, id: string, obj: JSONObject): Graph {
    const graph = new Graph(project, {
      ...Node.parseNode(id, obj),
      nodes: new Map<string, Node>(),
    });

    Object.entries((obj.nodes as JSONObject[]) ?? {}).reduce((nodes, item) => {
      const [nodeID, node] = item;

      nodes.set(nodeID, Node.parseNode(nodeID, node));

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
}
