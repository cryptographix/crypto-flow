import { AnyBlock, BlockDefinition } from "../mod.ts";
import { Package, PackageDefinition } from "./package.ts";

const rootPackage = new Package("");

function buildPackageMap(map: Map<string, Package>, pack: Package) {
  // 
  if (pack.blocks.size != 0) {
    map.set(pack.namespace, pack);
  }

  for (const subPack of pack.packages.values()) {
    buildPackageMap(map, subPack);
  }

  return map;
}

export const registry = {
  get rootPackage() { return rootPackage },

  reset() {
    rootPackage.reset();
  },

  registerPackage(pack: PackageDefinition | Package): Package {
    const [ns, packageID] = Package.extractFinalFromNamespace(pack.namespace);

    if (!(pack instanceof Package)) {
      pack = new Package(pack.namespace, pack);
    }

    rootPackage.ensurePackage(ns).addPackage(packageID, pack);

    return pack;
  },

  hasPackage(namespace: string) {
    return rootPackage.getPackage(namespace) !== undefined;
  },

  getBlockInfo<BLK extends AnyBlock = AnyBlock>(blockName: string): BlockDefinition<BLK> {
    const [ns, name] = Package.extractFinalFromNamespace(blockName);
    const pack = rootPackage.getPackage(ns);
    if (!pack)
      throw new Error(`Package not found: ${ns}`);

    const blockDefinition = pack.blocks.get(name) as BlockDefinition<BLK>;
    if (!blockDefinition)
      throw new Error(`Block ${blockName} not found`);

    return blockDefinition;
  },

  getPackageMap(): Map<string, Package> {
    return buildPackageMap(new Map(), rootPackage);
  }

  // get categories(): string[] {
  //   const categories = new Set<string>();

  //   this.registry.forEach((library) => {
  //     library.registry.forEach((reg, _key) => {
  //       if (reg.blockInfo.category!)
  //         categories.add(reg.blockInfo.category);
  //     });
  //   });

  //   return Array.from(categories.values());
  // }

  // get definitions(): BlockDefinition[] {
  //   const definitions = new Set<BlockDefinition>();

  //   this.registry.forEach((library) => {
  //     library.registry.forEach((definition, _key) => {
  //       definition.meta = { iconURL: "static/images/tools.png" };

  //       definitions.add(definition);
  //     });
  //   });

  //   return Array.from(definitions.values());
  // }

  // getByID(id: string): BlockDefinition | null {
  //   let definition: BlockDefinition | null = null;

  //   this.registry.forEach((library) => {
  //     if (!definition) {
  //       library.registry.forEach((defn) => {
  //         if (defn.id == id) definition = defn;
  //       });
  //     }
  //   });

  //   return definition;
  // }

  // getByName(name: string): BlockDefinition | undefined {
  //   let definition: BlockDefinition | undefined;

  //   this.registry.forEach((library) => {
  //     if (!definition) definition = library.registry.get(name);
  //   });

  //   return definition;
  // }
}


