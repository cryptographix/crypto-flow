import { JSONObject, JSONValue, AnyInterface, InterfaceDefinition, PropertyDefinition } from "../deps.ts";
import { AnyBlock, Block, BlockConstructor, BlockDefinition, BlockPropertyDefinitions, BlockType } from "../types/block.ts";

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

  types?: Record<string, BlockDefinition>;

  packages?: Record<string, PackageInfoNoNamespace>;
}

type PackageInfoNoNamespace = Omit<PackageDefinition, 'namespace'>;

export class Package {
  name: string;

  namespace: string;

  description: string;

  blocks: Map<string, BlockDefinition>;

  packages!: Map<string, Package>;

  constructor(namespace: string, pack?: PackageInfoNoNamespace) {
    const { name = "", description, blocks = {}, packages = {} } = pack ?? Package.emptyPackage;

    this.name = name;
    this.description = description ?? "";
    this.namespace = namespace;

    this.blocks = new Map(
      Object.entries(blocks).map(([blockID, blockInfo]) => [blockID, blockInfo])
    );

    this.packages = new Map();

    Object.entries(packages).forEach(([packageID, packageInfo]) => {
      this.addPackage(packageID, new Package(
        /*this,*/
        Package.extendNamespace(namespace, packageID),
        packageInfo)
      )
    }
    );
  }

  reset() {
    this.packages.forEach((pack) => pack.reset());
    this.packages.clear();

    this.blocks.clear();
    this.description = "";
    this.name = "";
    this.namespace = "";
  }

  protected lookupPackage(namespace: string, removeLastSegment = false, createIfMissing = false): Package | null {
    const names = Package.splitNamespace(namespace, removeLastSegment);
    const packageID = names[0];

    let pack = this.packages.get(packageID);

    if (!pack) {
      if (!createIfMissing)
        return null;

      pack = new Package(/*this, */Package.extendNamespace(this.namespace, packageID), {});

      this.addPackage(packageID, pack);
    }

    if (names.length > 1) {
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

  getPackage(namespace: string, removeLastSegment = false): Package | null {
    return this.lookupPackage(namespace, removeLastSegment);
  }

  addPackage(packageID: string, pack: Package) {
    this.packages.set(packageID, pack);

    //pack.parent = new WeakRef(this);
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

  static parsePackage(obj: JSONObject, parent?: Package, packageID?: string): Package {
    const { name, description, namespace } = obj;

    const ns = (parent && packageID)
      ? Package.extendNamespace(parent.namespace, packageID)
      : JSONValue.asString(namespace, "");

    const pack = new Package(ns, {
      name: JSONValue.asString(name, ""),
      description: JSONValue.asString(description, ''),
    });

    Object.entries((obj.blocks as JSONObject[]) ?? {}).reduce((blocks, item) => {
      const [blockID, blockInfo] = item;

      blocks.set(blockID, Package.parseBlockDefinition(blockID, blockInfo));

      return blocks;
    }, pack.blocks);

    pack.packages = Package.parsePackageMap(pack, obj.packages as JSONObject);

    return pack;
  }

  /**
   * Parse a POJO into a BlockDefinition
   */
  static parseBlockDefinition<IF extends AnyInterface, BLK extends Block<IF> = Block<IF>>(/*pack: Package, */name: string, obj: JSONObject): BlockDefinition<BLK> {
    const { type, namespace, description, category } = obj;

    const blockDefinition: BlockDefinition<BLK> = {
      type: type as BlockType,
      ctor: null as unknown as BlockConstructor<BLK>,
      name: name as string,
      namespace: namespace as string,
      description: description as string,
      category: category as string,
      propertyDefinitions: Object.entries((obj.props as JSONObject[]) ?? {}).reduce((propertyDefinitions: BlockPropertyDefinitions<BLK>, item) => {
        const [id, prop] = item;
        const idd = id as keyof typeof propertyDefinitions;

        propertyDefinitions[idd] = Package.parsePropertyDefinition(prop);

        return propertyDefinitions;
      }, {} as BlockPropertyDefinitions<BLK>)
    };


    return blockDefinition;
  }

  /**
   * Parse a POJO into a PropertyDefinition
   */
  static parsePropertyDefinition<T>(obj: JSONObject): PropertyDefinition<T> {
    const { dataType } = obj;

    return {
      dataType: JSONValue.asString(dataType) as unknown as "string" //PropertyDataTypes
    }
  }

  static readonly emptyBlockDefinition: BlockDefinition<AnyBlock> = {
    type: "none",
    ctor: undefined as unknown as BlockConstructor<AnyBlock>,
    name: "",
    propertyDefinitions: {},
  };

  static #packageToObject(pack: Package) {
    const { name, description, blocks: blocksIn = new Map(), packages: packagesIn = new Map() } = pack;

    const blocks = Array.from(blocksIn).reduce((blocks, [blockID, blockInfo]) => {
      blocks[blockID] = Package.#blockDefinitionToObject(blockInfo);

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

  static #blockDefinitionToObject<BLK>(blockDefinition: BlockDefinition): JSONObject {
    const { type, namespace, description, category } = blockDefinition;

    const props = Object.entries(blockDefinition.propertyDefinitions).reduce((props, [propID, _prop]) => {
      props[propID] = Package.#propertyDefinitionToObject(blockDefinition, propID);

      return props;
    }, {} as JSONObject);

    return JSONObject.clean({
      type,
      namespace,
      category,
      description,
      props,
    });
  }

  static #propertyDefinitionToObject<BLK>(blockDefinition: BlockDefinition, id: string): JSONObject {
    return blockDefinition.propertyDefinitions[id as keyof BlockPropertyDefinitions<BLK>] as unknown as JSONObject;
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
    //description: "",
    //namespace: "",
    blocks: {},
    packages: {},
  });

}
