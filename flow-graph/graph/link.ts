import { JSONObject, JSONValue } from "../deps.ts";
import { Port } from "../mod.ts";

export type LinkType = "normal"|"log"|"break";

export interface LinkInit {
  type?: LinkType;

  nodeID: string;

  portID: string;
}

export class Link {
  type?: LinkType;

  portID: string;

  nodeID: string;

  constructor(public port: Port, link: LinkInit) {
    const { type, portID, nodeID } = link;

    this.type = type;
    this.portID = portID;
    this.nodeID = nodeID;
  }

  static parseLink(port: Port, obj: JSONObject): Link {
    const { type, portID, nodeID } = obj;

    return new Link(port, {
      type: JSONValue.isString(type) ? JSONValue.asString(type) as LinkType : undefined,
      nodeID: JSONValue.asString(nodeID)!,
      portID: JSONValue.asString(portID)!,
    });
  }

  toObject(): JSONObject {
    const { type, nodeID, portID } = this;

    return JSONObject.clean({
      type: type ?? null,
      nodeID,
      portID,
    });
  }
}
