import { IBlockConstructor, IBlockInfo } from "./block.ts";

//TODO: Implementar library
export class BlockDefinition {
  constructor(id: string, ctor: IBlockConstructor) {
    if (ctor) {
      this.blockInfo = ctor.blockInfo;
      this.ctor = ctor;
    }

    this.id = id;
  }

  blockInfo!: IBlockInfo;

  ctor!: IBlockConstructor;

  id!: string;

  meta!: {
    iconURL?: string;
  };
}

export class BlockRegistry {
  registry = new Map<BlockLibrary, BlockLibrary>();

  constructor() {
  }

  register(library: BlockLibrary) {
    this.registry.set(library, library);
  }

  unregister(library: BlockLibrary) {
    this.registry.delete(library);
  }

  get categories(): string[] {
    const categories = new Set<string>();

    this.registry.forEach((library) => {
      library.registry.forEach((reg, _key) => {
        categories.add(reg.blockInfo.category);
      });
    });

    return Array.from(categories.values());
  }

  get definitions(): BlockDefinition[] {
    const definitions = new Set<BlockDefinition>();

    this.registry.forEach((library) => {
      library.registry.forEach((definition, _key) => {
        definition.meta = { iconURL: "static/images/tools.png" };

        definitions.add(definition);
      });
    });

    return Array.from(definitions.values());
  }

  getByID(id: string): BlockDefinition | null {
    let definition: BlockDefinition | null = null;

    this.registry.forEach((library) => {
      if (!definition) {
        library.registry.forEach((defn) => {
          if (defn.id == id) definition = defn;
        });
      }
    });

    return definition;
  }

  getByName(name: string): BlockDefinition | undefined {
    let definition: BlockDefinition | undefined;

    this.registry.forEach((library) => {
      if (!definition) definition = library.registry.get(name);
    });

    return definition;
  }
}

/**
 * Block Package
**/
export interface BlockPackageConstructor {
  new(registry: BlockLibrary, url: URL): BlockPackage;
}

export interface BlockPackage {
  url?: string;
}

/**
 * BlockLibrary
 *
 * A BlockLibrary is a collection of blocks
**/
export class BlockLibrary {
  registry = new Map<string, BlockDefinition>();

  modules = new Map<string, BlockPackageConstructor>();
  sources: string[] = [];

  constructor(public origin?: URL) {
  }

  get loaded(): boolean {
    return (this.modules.size != 0);
  }

  importPackage(from: URL): Promise<BlockPackageConstructor> {
    return new Promise<BlockPackageConstructor>((resolve, reject) => {
      switch (from.pathname) {
        case '/labs/crypto':
        case '/crypto':
          return import('../../cryptography/mod.ts')
            .then((module) => {
              resolve(module.default as unknown as BlockPackageConstructor);
            });
        /*case '/labs/payments':
        case '/payments':
          return import('../../components/payments/index')
            .then((module) => {
              resolve(module.default as any as BlockPackageConstructor);
            });*/
        default:
          reject("Unknown package: " + from.pathname);
      }
    });
  }

  loadModules(): Promise<void> {
    return this.importPackage(this.origin!)
      .then((pack) => {
        this.modules.set(this.origin!.toString(), pack);

        new pack(this, this.origin!);
      });
  }

  register(id: string, ctor: IBlockConstructor) {
    this.registry.set(ctor.blockInfo.name, new BlockDefinition(id, ctor));
  }
}
