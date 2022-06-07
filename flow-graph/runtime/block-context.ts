import {
  Block,
  BlockDefinition,
  BlockHelper,
  BlockFactory, BlockPropertyDefinitions,
  Node
} from "../mod.ts";

import { AbstractBlock } from "./abstract-block.ts";

import {
  PropertyValues,
  PropertyDataTypes,
  PropertyKey,
  PropertyInfos,
  PropertyValue,
  AnyInterface,
  PartialPropertiesOf,
  Schema,
  PropertiesOf,
  PropertyDefinition,
} from "../deps.ts";

export type BlockStatus =
  | "initialized"
  | "setup"
  | "waiting"
  | "ready"
  | "busy"
  | "done"
  | "finalized";

/**
 * BlockContext holds runtime state for a Block within a Network
 *
 * Contains a Block instance and a fresh copy of BlockInfo.
 */
export class BlockContext<IF extends AnyInterface> {
  #block: Block<IF>;

  #blockHelper: BlockHelper<Block<IF>>;

  #inPropKeys: PropertyKey<IF>[] = [];

  #outPropKeys: PropertyKey<IF>[] = [];

  #ready?: boolean;

  #status: BlockStatus = "initialized";

  #lastTriggerID = 0;

  #setPropertyInfos() {
    const propertyDefinitions = this.#blockHelper.propertyDefinitions;
    const blockPropertyKeys = Object.keys(propertyDefinitions) as PropertyKey<IF>[];

    this.#inPropKeys = blockPropertyKeys.filter(
      (key) => propertyDefinitions[key].accessors == "set"
    );

    this.#outPropKeys = blockPropertyKeys.filter(
      (key) => propertyDefinitions[key].accessors == "get"
    );
  }

  constructor(block: Block<IF>, blockHelper: BlockHelper<Block<IF>>) {
    this.#block = block;
    this.#blockHelper = blockHelper;

    // Cache property keys
    this.#setPropertyInfos();
  }

  get block(): Block<IF> { return this.#block; }
  get blockHelper(): BlockHelper<Block<IF>> { return this.#blockHelper; }
  get propertyDefinitions() { return this.#blockHelper.propertyDefinitions; }

  initializeBlock(config: PartialPropertiesOf<Block<IF>>) {
    // Initialize each property from Schema information
    // Precedence:
    //   1. config parameter
    //   2. initial value from class
    //   3. "default" value from schema property.default
    //   4. the default for property type
    for (const [key, propInfo] of Object.entries(this.propertyDefinitions)) {
      Schema.initPropertyFromPropertyType<PropertiesOf<Block<IF>>>(
        propInfo as PropertyDefinition<keyof PropertiesOf<Block<IF>>>,
        this.#block,
        key as keyof PropertiesOf<Block<IF>>,
        config[key as keyof AnyInterface] as PropertyValue,
        false);
    }
  }

  async setup(cfg: PartialPropertiesOf<IF>) {
    if (this.block.setup)
      await this.block.setup(cfg);
    else {
      this.blockHelper.setup(cfg);
    }

    this.#ready = undefined;
  }

  clearInputs() {
    const block: Partial<PropertyValues<IF>> = this
      .block as unknown as PropertyValues<IF>;

    // store supplied inputs ...
    this.#inPropKeys.forEach((key) => {
      block[key] = undefined;
    });

    this.#ready = undefined;
  }

  setInputs(values: Partial<PropertyValues<IF>>) {
    const block = this.block as unknown as PropertyValues<IF>;

    // store supplied inputs ...
    this.#inPropKeys.forEach((key) => {
      if (values[key] !== undefined) {
        block[key] = values[key]!;
      }
    });

    this.#ready = undefined;
  }

  canTrigger(triggerID: number): boolean {
    if (this.#ready === undefined) {
      const block = this.block as unknown as PropertyValues<IF>;
      const propInfos: PropertyInfos<IF> = this.propertyDefinitions as unknown as PropertyInfos<IF>;

      // all required inputs present ...
      this.#ready = this.#inPropKeys.every((key) => {
        const propInfo = propInfos[key];

        return block[key] !== undefined || propInfo.optional;
      });
    }

    return !!this.#ready && triggerID > this.#lastTriggerID;
  }

  /**
   * Asynchronously execute a block's `process()` method
   *
   * @returns results (if any) from block processing
   */
  async trigger(triggerID: number): Promise<PropertyValues<IF>> {
    if (this.canTrigger(triggerID)) {
      await this.block.run();

      this.#lastTriggerID = triggerID;

      // done processing
      this.#ready = false;

      const block = this.block as unknown as PropertyValues<Block<IF>>;

      // collect out properties and return
      const xx = this.#outPropKeys.reduce((outputs, key) => {
        outputs[key] = block[key] as unknown as PropertyValue;

        return outputs;
      }, {} as PropertyValues<IF>);

      return xx as PropertyValues<IF>;
    }

    return Promise.reject("not ready to process");
  }

  teardown() {
    this.#status = "finalized";
  }

  static fromNode<IF extends AnyInterface>(node: Node): Promise<BlockContext<IF>> {
    switch (node.type) {
      case "block": {
        return BlockContext.forBlockName(node.block.name!);
      }

      case "code": {
        return BlockContext.fromCodeNode(node);
      }

      case "root": case "flow": {
        const blockDefinition: BlockDefinition<Block<IF>> = {
          type: "flow",
          ctor: class extends AbstractBlock { run() { } },
          propertyDefinitions: {},
          name: node.name ?? node.id,
        }

        return Promise.resolve(BlockContext.for(blockDefinition));
      }
      case "input": {
        // noop
        break;
      }
      case "output": {
        // noop
        break;
      }
      default: {
        // TODO: error
        break;
      }
    }

    // noop
    return Promise.resolve(new BlockContext(null as unknown as Block<IF>, null as unknown as BlockHelper<Block<IF>>));
  }

  static forBlockName<IF>(blockName: string) {
    const factory = new BlockFactory<Block<IF>>("block", blockName);

    return factory.createInstance().then(
      (block) => {
        return new BlockContext(block, block.$helper);

      }
    );
  }

  static async fromCodeNode<IF extends AnyInterface>(node: Node): Promise<BlockContext<IF>> {
    const code = node.block!.code as string;

    // const url = "data:text/javascript," + code;

    // const module = await import(url);

    // if (module.default instanceof Function) {
    //   const blockFunc = module.default;

    //   const blockCtor: BlockConstructor<Block<IF>> = class {
    //     async run() {
    //       const ret = await blockFunc(this);

    //       if (ret instanceof Object) {
    //         Object.assign(this, ret);
    //       }
    //     }
    //   } as BlockConstructor<Block<IF>>;

    const propertyDefinitions = {} as BlockPropertyDefinitions<IF>;

    node.ports.forEach((port, key) => {
      propertyDefinitions[key as keyof BlockPropertyDefinitions<IF>] = {
        dataType: port.dataType as PropertyDataTypes,
        accessors: port.type == "in" ? "set" : "get",
      } as BlockPropertyDefinitions<IF>[keyof BlockPropertyDefinitions<IF>];
    });

    const factory = new BlockFactory("inline", "", code, propertyDefinitions);
  
    const block = await factory.createInstance()
  
    return new BlockContext<IF>(block, block.$helper);
  }

  // static async fromLoader<IF extends AnyInterface>(
  //   loader: PackageLoader,
  //   blockName: string
  // ): Promise<BlockContext<IF>> {

  //   await loader.loadPackages();

  //   const block = await new BlockFactory<Block<IF>>("block", blockName).createInstance();

  //   return new BlockContext(block, block.$helper);
  // }

  static async for<IF extends AnyInterface>(blockDefinition: BlockDefinition<Block<IF>>) {
    const block = await BlockFactory.for(blockDefinition).createInstance()

    return new BlockContext(block, block.$helper);
  }
}

//type BLKIF<BLK> = BLK extends Block<infer IF> ? IF : never;
