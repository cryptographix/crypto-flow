import { JSONObject } from "../deps.ts";
import { Port, IPort } from "./port.ts";

export type NodeType = "none" | "root" | "flow" | "block" | "code" | "input" | "output";

export interface INode<Port extends IPort = IPort> {
  type: NodeType;

  id: string;

  block: JSONObject | null;

  name: string;

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

  id: string;

  name: string;

  block: JSONObject | null;

  ports: Map<string, Port>;

  constructor(node: INode) {
    const { type, id, name, block = null, ports } = node;

    this.type = type;
    this.id = id;
    this.block = block;
    this.name = name;

    this.ports = new Map(
      Object.entries(ports).map(([_portID, port]) => [
        _portID,
        new Port(this, port),
      ])
    );
  }

  static parseNode(id: string, obj: JSONObject): Node {
    const { type, name, block } = obj;

    const node = new Node({
      type: type as NodeType,
      id,
      block: block as JSONObject,
      name: name as string,
      ports: new Map<string, Port>(),
    });

    Object.entries((obj.ports as JSONObject[]) ?? {}).reduce((ports, item) => {
      const [id, port] = item;

      ports.set(id, Port.parsePort(node, id, port));

      return ports;
    }, node.ports);

    return node;
  }

  toObject(): JSONObject {
    const { type, name, block } = this;

    const ports = Array.from(this.ports).reduce( (ports, [portID, port]) => {
      ports[portID] =  port.toObject();
      
      return ports;
    }, {} as JSONObject);

    return JSONObject.removeNullOrUndefined( {
      type,
      name,
      block,
      ports,
    } );  
  }
}
