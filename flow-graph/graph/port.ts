import { JSONObject, JSONValue } from "../deps.ts";
import { BlockPropertyDefinition, PropertyFlowDirection, PropertyKind, Node } from "../mod.ts";
import { Link } from "./link.ts";

/*export interface PortInit<T = unknown> {
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
  links: Array<Link>;
}*/

export interface Port<T = unknown> {
  kind: PropertyKind;

  direction: PropertyFlowDirection;

  name?: string;

  dataType: string;

  optional?: boolean;

  data?: T;

  links: Array<Link>;
};

export const Port = {
  parsePort(obj: JSONObject): Port {
    const { kind, direction, name, dataType, optional, data } = obj;

    const port: Port = {
      kind: JSONValue.asString(kind) as PropertyKind,
      direction: JSONValue.asString(direction) as PropertyFlowDirection,
      name: JSONValue.asString(name),
      dataType: JSONValue.asString(dataType, "")!,
      optional: JSONValue.asBoolean(optional),
      data,
      links: [],
    };

    // only "out" ports have links
    if (Port.isOutput(port)) {
      Array.from((obj.links as JSONObject[]) ?? []).reduce<Array<Link>>(
        (links, item: JSONObject) => {
          links.push(Link.parseLink(item));

          return links;
        },
        port.links
      );
    }

    return port;
  },

  isOutput(port: Port) {
    return port.direction == "out" || port.direction == "in-out";
  },

  accessorToDirection(accessors: BlockPropertyDefinition["accessors"]): PropertyFlowDirection {
    switch (accessors) {
      case "get": return "out";
      case "set": return "in";
      case "both": return "in-out";
      default: return "none";
    }
  },

  fromPropertyDefinition(propertyDefinition: BlockPropertyDefinition): Port {
    return {
      kind: propertyDefinition.kind ?? "data",
      direction: propertyDefinition.direction ?? Port.accessorToDirection(propertyDefinition.accessors),
      name: propertyDefinition.title,
      dataType: propertyDefinition.dataType,
      data: propertyDefinition.default,
      links: [],
    };
  },

  toObject(port: Port): JSONObject {
    const { kind, direction, name, dataType, optional, data, links } = port;

    const linksObj = Array.from(links).reduce((links, link) => {
      links.push(Link.toObject(link));

      return links;
    }, [] as JSONObject[]);

    return JSONObject.clean({
      kind,
      direction,
      name,
      dataType,
      optional,
      data: data as unknown as JSONValue, // TODO: structured types
      links: (direction == "out" || direction == "in-out") && links.length > 0 ? linksObj : undefined,
    });
  }

}
/*  constructor(port: PortInit<T>) {
    const { kind, direction, name, dataType, data, links = [] } = port;

    this.kind = kind;
    this.direction = direction;
    this.name = name;
    this.dataType = dataType;
    this.data = data;

    this.links = links.map((link) => {
      return new Link(link);
    });
  }

  get isOutput() {
    return this.direction == "out" || this.direction == "in-out";
  }

  static parsePort(obj: JSONObject): Port {
    const { kind, direction, name, dataType, optional, data } = obj;

    const port = new Port( {
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
      Array.from((obj.links as JSONObject[]) ?? []).reduce<Array<Link>>(
        (links, item: JSONObject) => {
          links.push(Link.parseLink(item));

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

  static fromPropertyDefinition(propertyDefinition: BlockPropertyDefinition): Port {
    return new Port({
      kind: propertyDefinition.kind ?? "data",
      direction: propertyDefinition.direction ?? Port.accessorToDirection(propertyDefinition.accessors),
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
}*/
