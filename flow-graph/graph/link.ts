import { JSONObject } from "../deps.ts";
import { Port, Node } from "../mod.ts";

export interface ILink {
  type?: string;

  nodeID: string;

  portID: string;
}

export class Link implements ILink {
  type?: string;

  portID: string;

  nodeID: string;

  node!: Node;

  constructor(public port: Port, link: ILink) {
    const { type, portID, nodeID } = link;

    this.type = type;
    this.portID = portID;
    this.nodeID = nodeID;
  }

  setup() {}

  static parseLink(port: Port, obj: JSONObject): Link {
    const { portID, nodeID } = obj;

    return new Link(port, {
      nodeID: nodeID as string,
      portID: portID as string,
    });
  }
  toObject(): JSONObject {
    const { portID, nodeID, type } = this;

    return {
      type: type ?? null,
      nodeID,
      portID,
    };
  }
}
