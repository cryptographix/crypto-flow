import { AnyInterface, PropertiesOf, PropertyValue, PropertyValues, Schema, PropertyKey, PropertyInfos } from "../deps.ts";
import { AnyBlock, Block, BlockConstructor, BlockDefinition, BlockHelper, BlockPropertiesOf, BlockPropertyDefinition, BlockPropertyDefinitions, BlockType, HasBlockHelper, PartialBlockPropertiesOf, Port, registry } from "../mod.ts";

type ExtractBlockIF<BLK extends AnyBlock> = BLK extends Block<infer IF> ? IF : never;

export type BlockMethods<BLK> = {
  run(): void | Promise<void>;
  setup(config: PartialBlockPropertiesOf<BLK>): void;
  teardown(): void;
}
export type BlockInstance<BLK extends AnyBlock> = BLK & BlockMethods<BLK> & HasBlockHelper<BLK> & ExtractBlockIF<BLK>;
export type BlockInstanceForIF<IF extends AnyInterface> = Block<IF> & BlockMethods<Block<IF>> & IF;

export class BlockFactory<BLK extends AnyBlock> {

  blockDefinition: Promise<BlockDefinition<BLK>>;

  constructor(type: "none", blockID: string, blockDefinition: BlockDefinition<BLK>)
  constructor(type: "block", blockID: string)
  constructor(type: "code", blockID: string, code: string, propertyDefinitions: BlockPropertyDefinitions<BLK>)
  constructor(public blockType: BlockType, public readonly blockID: string, codeOrDef?: string | BlockDefinition<BLK>, propertyDefinitions?: BlockPropertyDefinitions<BLK>) {
    switch (blockType) {
      case "none": {
        this.blockDefinition = Promise.resolve(codeOrDef as BlockDefinition<BLK>);
        break;
      }

      case "code": {
        this.blockDefinition = BlockFactory.buildCodeBlock(codeOrDef as string, propertyDefinitions ?? {} as BlockPropertyDefinitions<BLK>);
        break;
      }

      case "block":
      default: {
        this.blockDefinition = Promise.resolve(registry.getBlockInfo<BLK>(this.blockID));
        break;
      }
    }
  }

  async createInstance(): Promise<BlockInstance<BLK>> {
    const blockDefinition = await this.blockDefinition;


    // deno-lint-ignore ban-types
    function isConstructable(value: Function): value is BlockConstructor<BLK> {
      return !!value.prototype && !!value.prototype.constructor;
    }

    const ctor = blockDefinition.ctor;

    // ctor may return a promise, for lazy loading of block implementation
    const block = isConstructable(ctor)
      ? new ctor()
      : await ctor();

    const blockHelper = new BlockHelperImpl<BLK>(block, blockDefinition);

    Object.defineProperties(block, {
      '$helper': {
        enumerable: false,
        configurable: true,
        value: blockHelper,
        writable: false,
      }
    });

    if (!block.setup) {
      const setup = (config: PartialBlockPropertiesOf<BLK>) => {
        return blockHelper.setup(config!);
      };

      block.setup = setup;
    }

    if (!block.teardown) {
      const teardown = () => {
        blockHelper.teardown();

        Object.defineProperties(block, {
          '$helper': {
            value: undefined,
          }
        });
      };

      block.teardown = teardown;
    }

    return block as unknown as BlockInstance<BLK>;
  }

  static async buildCodeBlock<BLK extends AnyBlock>(code: string, propertyDefinitions: BlockPropertyDefinitions<BLK>): Promise<BlockDefinition<BLK>> {
    const url = "data:text/javascript," + code;

    const module = await import(url);

    if (module.default instanceof Function) {
      const blockFunc = module.default;

      const blockCtor: BlockConstructor<BLK> = (class {
        async run() {
          const ret = await blockFunc(this);

          if (ret instanceof Object) {
            Object.assign(this, ret);
          }
        }
      }) as BlockConstructor<BLK>;

      const blockDefinition: BlockDefinition<BLK> = {
        type: "code",
        ctor: blockCtor,
        name: "code",
        category: "code",
        propertyDefinitions
      };

      return blockDefinition;
    }

    return Promise.reject("Invalid code block");
  }

  static for<BLK extends AnyBlock>(blockDefinition: BlockDefinition<BLK>) {
    return new BlockFactory<BLK>("none", blockDefinition.name, blockDefinition);
  }

}

export class BlockHelperImpl<BLK extends AnyBlock> implements BlockHelper<BLK>
{
  #block: WeakRef<BLK>;

  readonly blockDefinition: BlockDefinition<BLK>;

  readonly propertyDefinitions!: BlockPropertyDefinitions<BLK>;

  #inPropKeys: PropertyKey<BLK>[] = [];

  #outPropKeys: PropertyKey<BLK>[] = [];

  #setPropertyInfos() {
    const propertyDefinitions = this.propertyDefinitions;
    const blockPropertyKeys = Object.keys(propertyDefinitions) as PropertyKey<BLK>[];

    Object.values(propertyDefinitions as BlockPropertyDefinitions<BLK>).forEach((pd) => {
      const pdef = pd as BlockPropertyDefinition<BLK>;

      if (!pdef.kind) pdef.kind = "data";
      if (!pdef.direction) {
        pdef.direction = Port.accessorToDirection(pdef.accessors);
      }
    })

    this.#inPropKeys = blockPropertyKeys.filter(
      (key) => ["in", "bidi"].includes(propertyDefinitions[key].direction ?? "none")
    );

    this.#outPropKeys = blockPropertyKeys.filter(
      (key) => ["out", "bidi"].includes(propertyDefinitions[key].direction ?? "none")
    );
  }
  get block(): BLK { return this.#block.deref()!; }

  constructor(block: BLK, blockDefinition: BlockDefinition<BLK>) {
    this.#block = new WeakRef(block);

    this.blockDefinition = blockDefinition;

    this.propertyDefinitions = {
      ...blockDefinition.propertyDefinitions
    };

    // Cache property keys
    this.#setPropertyInfos();

    //this.#ready = undefined;
  }

  #inputsChanged = false;
  resetInputs() {
    const block: Partial<PropertyValues<BLK>> = this
      .block as unknown as PropertyValues<BLK>;

    // store supplied inputs ...
    this.#inPropKeys.forEach((key) => {
      block[key] = undefined;
    });

    this.#ready = undefined;

    this.#inputsChanged = true;
  }

  set inputs(values: Partial<PropertyValues<BLK>>) {
    const block = this.block as unknown as PropertyValues<BLK>;

    // store supplied inputs ...
    this.#inPropKeys.forEach((key) => {
      if (values[key] !== undefined) {
        block[key] = values[key]!;
      }
    });

    this.#ready = undefined;

    this.#inputsChanged = true;
  }

  get inputsChanged() { return this.#inputsChanged }

  #ready?: boolean;
  get ready(): boolean {
    if (this.#ready === undefined) {
      if (this.block.ready instanceof Function) {
        this.#ready = this.block.ready();
      }
      else {
        const block = this.block as unknown as PropertyValues<BLK>;

        const propInfos: PropertyInfos<BLK> = this.propertyDefinitions as unknown as PropertyInfos<BLK>;

        // all required inputs present ...
        this.#ready = this.#inPropKeys.every((key) => {
          const propInfo = propInfos[key];

          return block[key] !== undefined || propInfo.optional;
        });
      }
    }

    return this.#ready!;
  }

  done() {
    this.#inputsChanged = false;

    // done processing
    this.#ready = false;
  }

  get outputs(): PropertyValues<BLK> {
    const block = this.block;

    // collect out properties and return
    const outputs = this.#outPropKeys.reduce((outputs, key) => {
      outputs[key] = block[key] as unknown as PropertyValue;

      return outputs;
    }, {} as PropertyValues<BLK>);

    return outputs;
  }

  /**
   * 
   * @param initProperties 
   */
  init(initProperties: PartialBlockPropertiesOf<BLK>) {
    const block = this.block;

    // Initialize each property from Schema information
    // Precedence:
    //   1. config parameter
    //   2. initial value from class
    //   3. "default" value from schema property.default
    //   4. the default for property type
    for (const [key, propInfo] of Object.entries(this.propertyDefinitions)) {
      Schema.initPropertyFromPropertyType<PropertiesOf<BLK>>(
        propInfo as BlockPropertyDefinition<keyof PropertiesOf<BLK>>,
        block,
        key as keyof PropertiesOf<BLK>,
        initProperties[key as keyof BlockPropertiesOf<BLK>] as unknown as PropertyValue,
        false);
    }
  }

  /**
   * 
   * @param config 
   */
  setup(config: PartialBlockPropertiesOf<BLK>) {
    const block = this.block;

    for (const [key, _propInfo] of Object.entries(this.propertyDefinitions)) {
      const value = config[key as keyof BlockPropertiesOf<BLK>];
      if (value !== undefined) {
        // deno-lint-ignore no-explicit-any
        (block as any)[key as keyof BLK] = value;
      }
    }
  }

  teardown(): void {
    const block = this.block as unknown as HasBlockHelper<BLK>;

    // cleanup
    Object.defineProperties(block, {
      '$helper': {
        value: undefined,
      }
    });
  }
}

