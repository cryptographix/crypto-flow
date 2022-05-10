import { JSONObject, JSONValue } from "../deps.ts";
import { Node } from "../mod.ts";
import { Link, ILink } from "./link.ts";

export type PortType = "none" | "in" | "out";

export interface IPort {
  type: PortType;

  portID: string;

  name: string;

  dataType: string;

  // for type "in"
  optional: boolean;

  // only for type="out"
  links: Array<ILink>;
}

export class Port<T = unknown> implements IPort {
  type: PortType;

  portID: string;

  name: string;

  dataType: string;

  optional = false;

  links: Array<Link>;

  data?: T;

  constructor(public node: Node, port: IPort) {
    const { type, portID, name, dataType, links } = port;

    this.type = type;
    this.portID = portID;
    this.name = name;
    this.dataType = dataType;

    this.links = links.map((link) => {
      return new Link(this, link);
    });
  }

  static parsePort(node: Node, portID: string, obj: JSONObject): Port {
    const { type, name, dataType, optional } = obj;

    const port = new Port(node, {
      type: type as PortType,
      portID,
      name: name as string,
      dataType: dataType as string,
      optional: !!optional ?? false,
      links: [] as Array<ILink>,
    });

    Array.from((obj.links as JSONValue[]) ?? []).reduce<Array<ILink>>(
      (links, item: JSONValue) => {
        links.push( Link.parseLink( port, item as JSONObject )) ;

        return links;
      },
      port.links
    );

    return port;
  }

  toObject(): JSONObject {
    const { portID, type, name } = this;

    const links = Array.from(this.links).reduce((links, link) => {
      links.push(link.toObject());

      return links;
    }, [] as JSONObject[]);

    return {
      portID,
      type,
      name,
      links,
    };
  }
}
