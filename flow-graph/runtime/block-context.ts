import {
  Block,
  IBlockConstructor,
  IBlockInfo,
  BlockPropertyInfos,
} from "../block/block.ts";
import { BlockLoader } from "../block/block-loader.ts";
import {
  PropertyValues,
  PropertyDataTypes,
  PartialPropertiesOf,
  IPropertyInfo,
  PropertyKey,
  NoProperties,
PropertyInfos,
PropertyValue,
AnyObject,
} from "../deps.ts";
import { INode } from "../mod.ts";

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
export class BlockContext<
  IF = AnyObject,
  BLK extends Block<IF> = Block<IF>
> {
  readonly block: BLK;
  readonly blockInfo: IBlockInfo<BLK>;
  #inPropKeys: PropertyKey<IF>[] = [];
  #outPropKeys: PropertyKey<IF>[] = [];
  #ready?: boolean;
  #status: BlockStatus = "initialized";
  #lastTriggerID = 0;

  #setPropertyInfos(propertyInfos: BlockPropertyInfos<BLK>) {
    const blockPropertyKeys = Object.keys(propertyInfos) as PropertyKey<IF>[];

    this.#inPropKeys = blockPropertyKeys.filter(
      (key) => propertyInfos[key].accessors == "set"
    );
    this.#outPropKeys = blockPropertyKeys.filter(
      (key) => propertyInfos[key].accessors == "get"
    );
  }

  constructor(blockCtor: IBlockConstructor<BLK>) {
    this.block = new blockCtor();
    this.blockInfo = blockCtor.blockInfo ?? { propertyInfos: {} };

    // Cache property keys
    this.#setPropertyInfos(this.blockInfo.propertyInfos);
  }

  async setup(cfg: PartialPropertiesOf<IF>) {
    const newProps = await this.block.setup(cfg);

    if (newProps) {
      // Specialize our copy of BlockInfo, overwriting any propInfos returned
      this.#setPropertyInfos({
        ...this.blockInfo.propertyInfos,
        ...newProps,
      });
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
      const propInfos: PropertyInfos<IF> = this.blockInfo.propertyInfos as unknown as PropertyInfos<IF>;

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

      const block = this.block as unknown as PropertyValues<BLK>;

      // collect out properties and return
      const xx = this.#outPropKeys.reduce((outputs, key) => {
        outputs[key] = block[key] as unknown as PropertyValue;

        return outputs;
      }, {} as PropertyValues<IF>);

      return xx;
    }

    return Promise.reject("not ready to process");
  }

  teardown() {
    this.#status = "finalized";
  }

  static async fromCode<IF>(node: INode): Promise<BlockContext<IF>> {
    const code = node.block!.code as string;

    const url = "data:text/javascript,"+code;

    const module = await import(url);

    if (module.default instanceof Function) {
      const blockFunc = module.default;

      const blockCtor: IBlockConstructor = class extends Block {
        async run() {
          const ret = await blockFunc(this);

          if (ret instanceof Object) {
            Object.assign(this, ret);
          }
        }

        static blockInfo: IBlockInfo = {
          name: "code",
          category: "code",
          propertyInfos: {},
        };
      };

      const propInfos: Record<string, IPropertyInfo> = {};

      node.ports.forEach((port, key) => {
        propInfos[key] = {
          dataType: port.dataType as unknown as PropertyDataTypes,
          accessors: port.type == "in" ? "set" : "get",
        };
      });

      blockCtor.blockInfo.propertyInfos = propInfos;

      return new BlockContext(blockCtor) as unknown as BlockContext<IF>;
    }

    return Promise.reject("Invalid code block");
  }

  static async fromLoader<B extends Block = Block>(
    loader: BlockLoader,
    name: string
  ): Promise<BlockContext> {
    const blockCtor = await loader.loadBlock(name);

    return new BlockContext(blockCtor);
  }
}
