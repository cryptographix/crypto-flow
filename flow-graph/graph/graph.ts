import { IProject } from "./project.ts";
import { Node, INode } from "./node.ts";
import { Port, IPort } from "./port.ts";
import { JSONObject } from "../deps.ts";

export type GraphType = "root"|"flow";

export interface IGraph<Node extends INode = INode, Port extends IPort = IPort>
  extends INode<Port> {
  type: GraphType;

  nodeID: string;

  title: string;

  nodes: Map<string, Node>;

  ports: Map<string, Port>;
}

/**
 * Flow represents, at run-time, a flow-graph consisting of connected nodes.
 */
export class Graph implements IGraph<Node, Port> {
  type: GraphType;

  nodeID: string;

  title: string;

  nodes: Map<string, Node>;
  ports: Map<string, Port>;

  constructor(public project: IProject, flow: IGraph) {
    const { type, nodeID, title, nodes, ports } = flow;

    this.type = type;
    this.nodeID = nodeID;
    this.title = title;

    this.nodes = new Map(
      Object.entries(nodes).map(([_nodeID, node]) => [
        _nodeID,
        new Node(this, node),
      ])
    );

    this.ports = new Map(
      Object.entries(ports).map(([_portID, port]) => [
        _portID,
        new Port(null as unknown as Node, port),
      ])
    );
  }

  static parseFlow(project: IProject, nodeID: string, obj: JSONObject): Graph {
    const { type = "flow", title = "" } = obj;

    const flow = new Graph(project, {
      type: type as GraphType,
      nodeID: nodeID as string,
      title: (title ?? "") as string,
      nodes: new Map<string, Node>(),
      ports: new Map<string, Port>(),
    });

    Object.entries(obj.nodes ?? {}).reduce((nodes, item) => {
      const [id, node] = item;

      nodes.set(id, Node.parseNode(flow, id, node));

      return nodes;
    }, flow.nodes);

    if (flow.ports) {
      const dummyNode = new Node(flow, {
        type: "none",
        nodeID: "",
        title: "",
        ports: new Map(),
      });

      Object.entries(flow.ports ?? {}).reduce((ports, item) => {
        const [id, port] = item;

        ports.set(id, Port.parsePort(dummyNode, id, port));

        return ports;
      }, flow.ports);
    }

    return flow;
  }

  toObject(): JSONObject {
    const { nodeID, type = "main", title = "" } = this;

    const nodes = Array.from(this.nodes).reduce((nodes, [nodeID, node]) => {
      nodes[nodeID] = node.toObject();

      return nodes;
    }, {} as JSONObject);

    const ports = Array.from(this.ports).reduce((ports, [portID, port]) => {
      ports[portID] = port.toObject();

      return ports;
    }, {} as JSONObject);

    return {
      type,
      nodeID,
      title,
      nodes,
      ports,
    };
  }
}
