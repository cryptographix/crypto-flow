import { JSONObject, JSONValue, AnyInterface, InterfaceDefinition, Schema } from "../deps.ts";
import { BlockFactory } from "../mod.ts";
import { AnyBlock, Block, BlockConstructor, BlockDefinition, BlockPropertyDefinition, Blockproperties, BlockType, PropertyKind, PropertyFlowDirection, BlockPropertiesOf } from "./block.ts";

/**
 * A Package is a collection of data-types, interfaces and block-factories.
 * 
 * Packages are namespaced, and may have sub-packages
 */

export interface PackageDefinition<IF = AnyInterface> {
  // namespace for package
  namespace: string;

  // Friendly name
  name?: string;

  // namespace for package
  description?: string;

  blocks?: Record<string, BlockDefinition<AnyBlock>>;

  interfaces?: Record<string, InterfaceDefinition>;

  types?: Record<string, Schema>;

  packages?: Record<string, PackageInfoNoNamespace>;
}

type PackageInfoNoNamespace = Omit<PackageDefinition, 'namespace'>;

export class Package {
  name: string;

  namespace: string;

  description: string;

  interfaces: Map<string, InterfaceDefinition>;

  types: Map<string, Schema>;

  blocks: Map<string, BlockDefinition>;

  packages!: Map<string, Package>;

  constructor(namespace: string = "", pack?: PackageInfoNoNamespace) {
    const { name = "", description, interfaces = {}, types = {}, blocks = {}, packages = {} } = pack ?? Package.emptyPackage;

    this.name = name;
    this.description = description ?? "";
    this.namespace = namespace;

    this.interfaces = new Map(
      Object.entries(interfaces).map(([interfaceID, interfaceInfo]) => [interfaceID, interfaceInfo])
    );

    this.types = new Map(
      Object.entries(types).map(([typeID, typeInfo]) => [typeID, typeInfo])
    );

    this.blocks = new Map(
      Object.entries(blocks).map(([id, blockInfo]) => [id, blockInfo])
    );

    this.packages = new Map();

    Object.entries(packages).forEach(([packageID, packageInfo]) => {
      const [ns, finalPackageID] = Package.extractFinalFromNamespace(packageID);
      const parentPackage = (ns == "") ? this : this.ensurePackage(ns);

      parentPackage.addPackage(finalPackageID, new Package(
        Package.extendNamespace(parentPackage.namespace, finalPackageID),
        packageInfo)
      )
    });
  }

  reset() {
    this.packages.forEach((pack) => pack.reset());
    this.packages.clear();

    this.blocks.clear();
    this.description = "";
    this.name = "";
    this.namespace = "";
  }

  protected lookupPackage(namespace: string, removeLastSegment = false, createIfMissing = false): Package | undefined {
    const names = Package.splitNamespace(namespace, removeLastSegment);
    const packageID = names[0];

    // no namespace
    if (packageID == "") return this;

    let pack = this.packages.get(packageID);

    if (!pack && createIfMissing) {
      pack = new Package(/*this, */Package.extendNamespace(this.namespace, packageID), { name: packageID });

      this.addPackage(packageID, pack);
    }

    if (pack && names.length > 1) {
      return pack.lookupPackage(namespace.slice(packageID.length + 1), removeLastSegment, createIfMissing);
    }

    return pack;
  }

  /**
   * 
   */
  ensurePackage(namespace: string, removeLastSegment = false): Package {
    return this.lookupPackage(namespace, removeLastSegment, true)!;
  }

  hasPackage(namespace: string) {
    return this.lookupPackage(namespace) !== undefined;
  }

  getPackage(namespace: string, removeLastSegment = false): Package {
    const pack = this.lookupPackage(namespace, removeLastSegment);
    if (pack) return pack;

    throw new Error(`Package ${namespace} not found`);
  }

  addPackage(packageID: string, pack: Package) {
    if (packageID != "")
      this.packages.set(packageID, pack);
    else {
      pack.blocks.forEach((block, id) => this.blocks.set(id, block));
    }
  }

  /**
   * 
   */
  toObject(): JSONObject {
    return Package.#packageToObject(this);
  }

  static parsePackageMap(parent: Package, packages: JSONObject) {
    return Object.entries(JSONValue.asObject(packages, {})).reduce((packages, item) => {
      const [packageID, pack] = item;

      packages.set(packageID, Package.parsePackage(pack as unknown as JSONObject, parent, packageID));

      return packages;
    }, new Map());
  }

  static async parsePackage(obj: JSONObject, parent?: Package, packageID?: string): Promise<Package> {
    const { name, description, namespace } = obj;

    const ns = (parent && packageID)
      ? Package.extendNamespace(parent.namespace, packageID)
      : JSONValue.asString(namespace, "");

    const pack = new Package(ns, {
      name: JSONValue.asString(name, ""),
      description: JSONValue.asString(description, ''),
    });

    for (const [id, blockInfo] of Object.entries((obj.blocks as JSONObject[]) ?? {})) {
      pack.blocks.set(id, await Package.parseBlockDefinition(blockInfo));
    }

    pack.packages = Package.parsePackageMap(pack, obj.packages as JSONObject);

    return pack;
  }

  /**
   * Parse a POJO into a BlockDefinition
   */
  static async parseBlockDefinition<IF extends AnyInterface, BLK extends Block<IF> = Block<IF>>(obj: JSONObject): Promise<BlockDefinition<BLK>> {
    const { type, name, description, category } = obj;

    let ctor = null as unknown as BlockConstructor<BLK>;

    switch (type) {
      case "code": {
        ctor = (await BlockFactory.buildCodeBlock<BLK>(JSONValue.asString(obj.code)!, {} as Blockproperties<BLK>)).ctor as BlockConstructor<BLK>;
        break;
      }

      case "flow": {
        break;
      }

      default: {
        throw new Error(`${type} not valid for block.type`)
      }
    }

    const blockDefinition: BlockDefinition<BLK> = {
      type: JSONValue.asString(type) as BlockType,
      ctor,
      name: JSONValue.asString(name)!,
      description: JSONValue.asString(description),
      category: JSONValue.asString(category),
      properties: Object.entries((obj.properties as JSONObject[]) ?? {}).reduce((properties: Blockproperties<BLK>, item) => {
        const [id, prop] = item;
        const idd = id as keyof typeof properties;

        properties[idd] = Package.parsePropertyDefinition(prop);

        return properties;
      }, {} as Blockproperties<BLK>)
    };


    return blockDefinition;
  }

  /**
   * Parse a POJO into a PropertyDefinition
   */
  static parsePropertyDefinition<T>(obj: JSONObject): BlockPropertyDefinition<T> {
    const { kind, direction, dataType, title, description, constant, optional, default: defValue, accessors } = obj;

    return {
      kind: JSONValue.asString(kind) as PropertyKind,
      direction: JSONValue.asString(direction) as PropertyFlowDirection,
      dataType: JSONValue.asString(dataType) as unknown as "string", //PropertyDataTypes
      title: JSONValue.asString(title),
      description: JSONValue.asString(description, undefined),
      constant: JSONValue.asBoolean(constant, undefined),
      optional: JSONValue.asBoolean(optional, undefined),
      default: defValue as unknown as T,
      accessors: JSONValue.asString(accessors) as BlockPropertyDefinition["accessors"],
    };
  }

  static readonly emptyBlockDefinition: BlockDefinition<AnyBlock> = {
    type: "block",
    ctor: undefined as unknown as BlockConstructor<AnyBlock>,
    name: "",
    properties: {},
  };

  static #packageToObject(pack: Package) {
    const { name, description, blocks: blocksIn = new Map(), packages: packagesIn = new Map() } = pack;

    const blocks = Array.from(blocksIn).reduce((blocks, [id, blockInfo]) => {
      blocks[id] = Package.#blockDefinitionToObject(blockInfo);

      return blocks;
    }, {} as JSONObject);

    const packages = Array.from(packagesIn).reduce((packages, [packageID, packageInfo]) => {
      packages[packageID] = Package.#packageToObject(packageInfo);

      return packages;
    }, {} as JSONObject);


    return JSONObject.clean({
      name,
      description,
      blocks,
      packages,
    });
  }

  static #blockDefinitionToObject<BLK extends AnyBlock>(blockDefinition: BlockDefinition<BLK>): JSONObject {
    const { type, description, category } = blockDefinition;

    const properties = {} as JSONObject;

    for( const [propertyID, propertyDefinition] of Object.entries(blockDefinition.properties)) {
      properties[propertyID] = Package.#propertyDefinitionToObject(propertyDefinition as BlockPropertyDefinition<BLK>);
    }

    return JSONObject.clean({
      type,
      category,
      description,
      properties,
    });
  }

  // static #propertyDefinitionToObject<BLK extends AnyBlock>(id: keyof BlockPropertiesOf<BLK>, properties: BlockPropertiesOf<BLK>): JSONObject {
  //   return properties[id as keyof BlockPropertiesOf<BLK>] as unknown as JSONObject;
  // }
  static #propertyDefinitionToObject<BLK extends AnyBlock>(propertyDefinition: BlockPropertyDefinition<BLK>): JSONObject {
    // TODO: 
    return propertyDefinition as unknown as JSONObject;
  }
  

  static extendNamespace(namespace: string, packID: string) {
    return (namespace != "")
      ? `${namespace}.${packID}`
      : packID;
  }

  static splitNamespace(namespace: string, ignoreLastSegment = false) {
    const segments = namespace.split('.');

    if (ignoreLastSegment)
      segments.pop();

    return segments;
  }

  static extractFinalFromNamespace(namespace: string): [string, string] {
    const segments = namespace.split('.');
    const last = segments.pop()!;

    return [namespace.slice(0, -last.length - 1), last];
  }

  static readonly emptyPackage: PackageInfoNoNamespace = Object.freeze({
    name: "",
    description: "",
    interfaces: {},
    types: {},
    blocks: {},
    packages: {},
  });

}
