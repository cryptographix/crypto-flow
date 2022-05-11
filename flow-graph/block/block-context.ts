import { NoProperties, IPropertyValues } from "../deps.ts";
import { BlockLoader } from "./block-loader.ts";
import { Block, IBlockConstructor, IBlockInfo } from "./block.ts";

type BlockFunction = {
  (params: Partial<IPropertyValues>): IPropertyValues;
};

/**
 *
 */
export class BlockContext<IN = NoProperties, OUT = NoProperties> {
  #block: Block;
  #blockInfo: IBlockInfo;

  constructor(blockCtor: IBlockConstructor) {
    this.#block = new blockCtor();
    this.#blockInfo = blockCtor.blockInfo;
  }

  get block() { return this.#block };
  get blockInfo() { return this.#blockInfo; }

  static async fromCode(code: string): Promise<BlockContext> {
    const myJSFile = new Blob([code], { type: "application/javascript" });
    const myJSURL = URL.createObjectURL(myJSFile);

    const module = await import(myJSURL);

    if (module.default instanceof Function) {
      const blockFunc = module.default;

      const blockCtor: IBlockConstructor = class extends Block {
        process(params: IPropertyValues): IPropertyValues {
          return blockFunc(params);
        }

        static blockInfo = {
          name: "",
          category: "",
          propInfo: {},
        };
      };

      return new BlockContext(blockCtor);
    }

    return Promise.reject("Invalid code block")
  }

  static async fromLoader(
    loader: BlockLoader,
    name: string
  ): Promise<BlockContext> {
    const blockCtor = await loader.loadBlock(name);

    return new BlockContext(blockCtor);
  }
}
