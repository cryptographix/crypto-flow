import { JSONObject, JSONValue } from "../deps.ts";
import { BlockPropertyDefinition, PropertyFlowDirection, PropertyKind, Node } from "../mod.ts";
import { Link, LinkInit } from "./link.ts";

export interface PortInit<T = unknown> {
  // "Kind" of Port - event/data/api/protocol
  kind: PropertyKind;

  // direction of data-flow to/from port: in/out/in-out
  direction: PropertyFlowDirection;

  // Friendly-name
  name?: string;

  // Type of data that flows through port
  dataType: string;

  // property required for run() - only type="in"/"in-out"
  optional?: boolean;

  // fixed input, for
  data?: T;

  // only direction="out"/"in-out"
  links: Array<LinkInit>;
}

export class Port<T = unknown> {
  kind: PropertyKind;

  direction: PropertyFlowDirection;

  name?: string;

  dataType: string;

  optional = false;

  data?: T;

  links: Array<Link>;

  constructor(public node: Node, port: PortInit<T>) {
    const { kind, direction, name, dataType, data, links = [] } = port;

    this.kind = kind;
    this.direction = direction;
    this.name = name;
    this.dataType = dataType;
    this.data = data;

    this.links = links.map((link) => {
      return new Link(this, link);
    });
  }

  get isOutput() {
    return this.direction == "out" || this.direction == "in-out";
  }

  static parsePort(node: Node, obj: JSONObject): Port {
    const { kind, direction, name, dataType, optional, data } = obj;

    const port = new Port(node, {
      kind: JSONValue.asString(kind) as PropertyKind,
      direction: JSONValue.asString(direction) as PropertyFlowDirection,
      name: JSONValue.asString(name),
      dataType: JSONValue.asString(dataType, "")!,
      optional: JSONValue.asBoolean(optional),
      data,
      links: [],
    });

    // only "out" ports have links
    if (port.isOutput) {
      Array.from((obj.links as JSONObject[]) ?? []).reduce<Array<LinkInit>>(
        (links, item: JSONObject) => {
          links.push(Link.parseLink(port, item));

          return links;
        },
        port.links
      );
    }

    return port;
  }

  static accessorToDirection(accessors: BlockPropertyDefinition["accessors"]): PropertyFlowDirection {
    switch (accessors) {
      case "get": return "out";
      case "set": return "in";
      case "both": return "in-out";
      default: return "none";
    }
  }

  static fromPropertyDefinition(node: Node, propertyDefinition: BlockPropertyDefinition): Port {
    return new Port(node, {
      kind: propertyDefinition.kind ?? "data",
      direction: Port.accessorToDirection(propertyDefinition.accessors),
      name: propertyDefinition.title,
      dataType: propertyDefinition.dataType,
      data: propertyDefinition.default,
      links: [],
    });
  }

  toObject(): JSONObject {
    const { kind, direction, name, dataType, optional, data } = this;

    const links = Array.from(this.links).reduce((links, link) => {
      links.push(link.toObject());

      return links;
    }, [] as JSONObject[]);

    return JSONObject.clean({
      kind,
      direction,
      name,
      dataType,
      optional,
      data: data as unknown as JSONValue, // TODO: structured types
      links: (direction == "out" || direction == "in-out") && links.length > 0 ? links : undefined,
    });
  }
}
