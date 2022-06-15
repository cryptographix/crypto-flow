import { JSONObject, JSONValue } from "../deps.ts";
import { Port } from "../mod.ts";

export interface LinkInit {
  type?: string;

  nodeID: string;

  portID: string;
}

export class Link {
  type?: string;

  portID: string;

  nodeID: string;

  constructor(public port: Port, link: LinkInit) {
    const { type, portID, nodeID } = link;

    this.type = type;
    this.portID = portID;
    this.nodeID = nodeID;
  }

  static parseLink(port: Port, obj: JSONObject): Link {
    const { portID, nodeID } = obj;

    return new Link(port, {
      nodeID: JSONValue.asString(nodeID)!,
      portID: JSONValue.asString(portID)!,
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
