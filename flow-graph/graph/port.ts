import { JSONObject } from "../deps.ts";
import { Node } from "../mod.ts";
import { Link, ILink } from "./link.ts";

export type PortType = "none" | "in" | "out";

export interface IPort {
  type: PortType;

  id: string;

  name: string;

  dataType: string;

  // for type "in"
  optional?: boolean;

  // only for type="out"
  links: Array<ILink>;
}

export class Port<T = unknown> implements IPort {
  type: PortType;

  id: string;

  name: string;

  dataType: string;

  optional = false;

  links: Array<Link>;

  data?: T;

  constructor(public node: Node, port: IPort) {
    const { type, id, name, dataType, links = [] } = port;

    this.type = type;
    this.id = id;
    this.name = name;
    this.dataType = dataType;

    this.links = links.map((link) => {
      return new Link(this, link);
    });
  }

  static parsePort(node: Node, id: string, obj: JSONObject): Port {
    const { type, name, dataType, optional } = obj;

    const port = new Port(node, {
      type: type as PortType,
      id,
      name: name as string,
      dataType: dataType as string,
      optional: !!optional ?? false,
      links: [],
    });

    // only "out" ports have links
    if (type == "out") {
      Array.from((obj.links as JSONObject[]) ?? []).reduce<Array<ILink>>(
        (links, item: JSONObject) => {
          links.push(Link.parseLink(port, item));

          return links;
        },
        port.links
      );
    }

    return port;
  }

  toObject(): JSONObject {
    const { type, name, dataType } = this;

    const links = Array.from(this.links).reduce((links, link) => {
      links.push(link.toObject());

      return links;
    }, [] as JSONObject[]);

    const port: JSONObject = {
      type,
      dataType,
      name,
    };

    // only "out" ports have links
    if (type == "out" && links.length > 0) port.links = links;

    return port;
  }
}
