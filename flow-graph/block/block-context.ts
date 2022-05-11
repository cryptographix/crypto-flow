import { NoProperties, PropertyValues } from "../deps.ts";
import { BlockLoader } from "./block-loader.ts";
import { Block, IBlockConstructor, IBlockInfo } from "./block.ts";

type BlockFunction = {
  (params: Partial<PropertyValues>): PropertyValues
};

/**
 * 
 */
export class BlockContext<IN=NoProperties,OUT=NoProperties> {
  #block: Block;
  #blockInfo: IBlockInfo;

  constructor( blockCtor: IBlockConstructor ) {
    this.#block = new blockCtor({});
    this.#blockInfo = blockCtor.blockInfo;
  }

  static fromCode( code: string ): BlockContext {
    const blockFunc = new Function( "params", code ) as BlockFunction; 

    const blockCtor: IBlockConstructor = class extends Block {
      process(params: PropertyValues): PropertyValues{
        return blockFunc( params );
      }
      
      static blockInfo = {
        name: "",
        category: "",
        propInfo: {}
      }
    }

    return new BlockContext( blockCtor );
  }

  static async fromLoader( loader: BlockLoader, name: string ): Promise<BlockContext> {
    const blockCtor = await loader.loadBlock(name);

    return new BlockContext( blockCtor );
  }
}