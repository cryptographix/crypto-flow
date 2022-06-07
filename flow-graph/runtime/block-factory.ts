import { AnyInterface, PartialPropertiesOf, PropertiesOf, PropertyDefinition, PropertyValue, Schema } from "../deps.ts";
import { AnyBlock, Block, BlockConstructor, BlockDefinition, BlockHelper, BlockPropertiesOf, BlockPropertyDefinitions, BlockType, registry } from "../mod.ts";

type ExtractBlockIF<BLK extends AnyBlock> = BLK extends Block<infer IF> ? IF : never;

export type BlockMethods<BLK> = {
  run(): void | Promise<void>; setup(config: PartialPropertiesOf<BLK>): void; teardown(): void;
}
export type BlockInstance<BLK extends AnyBlock> = BLK & BlockMethods<BLK> & ExtractBlockIF<BLK>;

export class BlockFactory<BLK extends AnyBlock> {

  blockDefinition: Promise<BlockDefinition<BLK>>;

  constructor(type: "none", blockName: string, blockDefinition: BlockDefinition<BLK>)
  constructor(type: "block", blockName: string)
  constructor(type: "inline", blockName: string, code: string, propertyDefinitions: BlockPropertyDefinitions<BLK>)
  constructor(public blockType: BlockType, public readonly blockName: string, codeOrDef?: string | BlockDefinition<BLK>, propertyDefinitions?: BlockPropertyDefinitions<BLK>) {
    switch (blockType) {
      case "none": {
        this.blockDefinition = Promise.resolve(codeOrDef as BlockDefinition<BLK>);
        break;
      }

      case "inline": {
        this.blockDefinition = BlockFactory.#buildCodeBlock(codeOrDef as string, propertyDefinitions ?? {} as BlockPropertyDefinitions<BLK>);
        break;
      }

      default: {
        this.blockDefinition = Promise.resolve(registry.getBlockInfo<BLK>(this.blockName));
        break;
      }
    }
  }

  async createInstance(): Promise<BlockInstance<BLK>> {
    const blockDefinition = await this.blockDefinition;

    const block = new blockDefinition.ctor();
    const blockHelper = new BlockHelperImpl(block, blockDefinition);

    Object.defineProperties(block, {
      '$helper': {
        enumerable: false,
        configurable: false,
        value: blockHelper,
        writable: false,
      }
    });

    if (!block.setup) {
      const func = (config: PartialPropertiesOf<BLK>) => { return block.$helper.setup(config!); };

      block.setup = func;
    }

    if (!block.teardown) {
      const func = () => { block.$helper.teardown(); };

      block.teardown = func;
    }

    return block as unknown as BlockInstance<BLK>;
  }

  static async #buildCodeBlock<BLK extends AnyBlock>(code: string, propertyDefinitions: BlockPropertyDefinitions<BLK>) {
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
        type: "inline",
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

  readonly propertyDefinitions!: BlockPropertyDefinitions<BLK>;

  readonly blockDefinition: BlockDefinition<BLK>;

  get block(): BLK { return this.#block.deref()!; }

  constructor(bloc: BLK, blockDefinition: BlockDefinition<BLK>) {
    this.#block = new WeakRef(bloc);

    this.blockDefinition = blockDefinition;

    this.propertyDefinitions = {
      ...blockDefinition.propertyDefinitions
    };
  }

  /**
   * 
   * @param initProperties 
   */
  init(initProperties: Partial<BlockPropertiesOf<BLK>>) {
    const block = this.block;

    // Initialize each property from Schema information
    // Precedence:
    //   1. config parameter
    //   2. initial value from class
    //   3. "default" value from schema property.default
    //   4. the default for property type
    for (const [key, propInfo] of Object.entries(this.propertyDefinitions)) {
      Schema.initPropertyFromPropertyType<PropertiesOf<BLK>>(
        propInfo as PropertyDefinition<keyof PropertiesOf<BLK>>,
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
  setup(config: Partial<BlockPropertiesOf<BLK>>) {
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
    // cleanup
    (this.block as { $helper?: AnyInterface }).$helper = undefined;
  }
}

