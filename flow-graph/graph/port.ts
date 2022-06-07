import { JSONObject, JSONValue } from "../deps.ts";
import { Node } from "../mod.ts";
import { Link, LinkInfo } from "./link.ts";

export type PortType = "none" | "in" | "out";

export interface PortInfo<T = unknown> {
  type: PortType;

  id: string;

  name?: string;

  dataType: string;

  // for type "in"
  optional?: boolean;

  data?: T;

  // only for type="out"
  links: Array<LinkInfo>;
}

export class Port<T = unknown> implements PortInfo<T> {
  type: PortType;

  id: string;

  name?: string;

  dataType: string;

  optional = false;

  data?: T;

  links: Array<Link>;

  constructor(public node: Node, port: PortInfo) {
    const { type, id, name, dataType, data, links = [] } = port;

    this.type = type;
    this.id = id;
    this.name = name;
    this.dataType = dataType;
    this.data = data as unknown as T;

    this.links = links.map((link) => {
      return new Link(this, link);
    });
  }

  static parsePort(node: Node, id: string, obj: JSONObject): Port {
    const { type, name, dataType, optional, data } = obj;

    const port = new Port(node, {
      type: type as PortType,
      id,
      name: name as string,
      dataType: dataType as string,
      optional: !!optional,
      data,
      links: [],
    });

    // only "out" ports have links
    if (type == "out") {
      Array.from((obj.links as JSONObject[]) ?? []).reduce<Array<LinkInfo>>(
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
    const { type, name, dataType, optional, data } = this;

    const links = Array.from(this.links).reduce((links, link) => {
      links.push(link.toObject());

      return links;
    }, [] as JSONObject[]);

    return JSONObject.removeNullOrUndefined({
      type,
      name,
      dataType,
      optional,
      data: data as unknown as JSONValue, // TODO: structured types
      links: type == "out" && links.length > 0 ? links : undefined,
    });
  }
}
