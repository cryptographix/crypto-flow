import { Block, IBlockConstructor } from "./block.ts";

//TODO: Implementar
export class BlockLoader {
  loadBlock<B extends Block>(_name: string): Promise<IBlockConstructor<B>> {
    return Promise.resolve(null as unknown as IBlockConstructor<B>);
  }
}
