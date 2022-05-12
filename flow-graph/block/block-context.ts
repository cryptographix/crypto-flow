import { Block, IBlockConstructor, IBlockInfo } from "./block.ts";
import { BlockLoader } from "./block-loader.ts";
import {
  PropertyValues,
  PropertyInfos,
  PropertyDataTypes,
  PartialPropertiesOf,
  IPropertyInfo,
} from "../deps.ts";
import { INode } from "../mod.ts";

type BlockFunction = {
  (params: Partial<PropertyValues>): PropertyValues;
};

/**
 * BlockContext holds runtime state for a Block within a Network
 *
 * Contains a Block instance, a fresh copy of BlockInfo, and a hash of
 * already supplied input values.
 */
export class BlockContext<BLK extends Block = Block> {
  #block: BLK;
  #blockInfo: IBlockInfo<BLK>;
  #inPropKeys: string[];
  #outPropKeys: string[];
  #ready?: boolean;
  #lastTriggerID = 0;

  #setBlockInfo(blockInfo: IBlockInfo<BLK>) {
    this.#blockInfo = blockInfo;

    const propertyInfos: Record<string, IPropertyInfo> = blockInfo.propInfos;
    const blockPropertyKeys = Object.keys(blockInfo.propInfos);

    this.#inPropKeys = blockPropertyKeys.filter(
      (key) => propertyInfos[key].accessors == "set"
    );
    this.#outPropKeys = blockPropertyKeys.filter(
      (key) => propertyInfos[key].accessors == "get"
    );
  }

  constructor(blockCtor: IBlockConstructor<BLK>) {
    this.#block = new blockCtor();
    this.#blockInfo = blockCtor.blockInfo ?? { propInfos: {} };

    this.#inPropKeys = [];
    this.#outPropKeys = [];

    // Cache property keys
    this.#setBlockInfo(this.#blockInfo);
  }

  get block() {
    return this.#block;
  }
  get blockInfo() {
    return this.#blockInfo;
  }

  async setup(cfg: PartialPropertiesOf<BLK>) {
    const newProps = await this.#block.setup(cfg);

    if (newProps) {
      // Specialize our copy of BlockInfo, overwriting any propInfos returned
      this.#setBlockInfo({
        ...this.#blockInfo,
        propInfos: {
          ...this.#blockInfo.propInfos,
          ...newProps,
        },
      });
    }

    this.#ready = undefined;
  }

  clearInputs() {
    const block: Partial<PropertyValues> = this
      .#block as unknown as PropertyValues;

    // store supplied inputs ...
    this.#inPropKeys.forEach((key) => {
      block[key] = undefined;
    });

    this.#ready = undefined;
  }

  setInputs(values: PropertyValues) {
    const block: PropertyValues = this.#block as unknown as PropertyValues;

    // store supplied inputs ...
    this.#inPropKeys.forEach((key) => {
      if (values[key] !== undefined) {
        block[key] = values[key];
      }
    });

    this.#ready = undefined;
  }

  canProcess(triggerID: number): boolean {
    if (this.#ready === undefined) {
      const block: PropertyValues = this.#block as unknown as PropertyValues;
      const propInfos: PropertyInfos = this.#blockInfo.propInfos;

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
  async process(triggerID: number): Promise<PropertyValues> {
    if (this.canProcess(triggerID)) {
      await this.#block.process();

      this.#lastTriggerID = triggerID;

      const block: PropertyValues = this.#block as unknown as PropertyValues;

      // collect out properties and return
      return this.#outPropKeys.reduce<PropertyValues>((outputs, key) => {
        outputs[key] = block[key];

        return outputs;
      }, {});
    }

    return Promise.reject("not ready to process");
  }

  teardown() {
    this.#block = {} as BLK;
    this.#blockInfo = {} as IBlockInfo<BLK>;
  }

  static async fromCode(node: INode): Promise<BlockContext> {
    const code = node.block!.code as string;

    const myJSFile = new Blob([code], { type: "application/javascript" });
    const myJSURL = URL.createObjectURL(myJSFile);

    const module = await import(myJSURL);

    if (module.default instanceof Function) {
      const blockFunc = module.default;

      const blockCtor: IBlockConstructor = class extends Block {
        async process() {
          const ret = await blockFunc(this);

          if (ret instanceof Object) {
            Object.assign(this, ret);
          }
        }

        static blockInfo: IBlockInfo = {
          name: "code",
          category: "code",
          propInfos: {},
        };
      };

      const propInfos: PropertyInfos = {};

      node.ports.forEach((port, key) => {
        propInfos[key] = {
          dataType: port.dataType as unknown as PropertyDataTypes,
          accessors: port.type == "in" ? "set" : "get",
        };
      });

      blockCtor.blockInfo.propInfos = propInfos;
      console.log(propInfos);
      return new BlockContext(blockCtor);
    }

    return Promise.reject("Invalid code block");
  }

  static async fromLoader(
    loader: BlockLoader,
    name: string
  ): Promise<BlockContext> {
    const blockCtor = await loader.loadBlock(name);

    return new BlockContext(blockCtor);
  }
}
