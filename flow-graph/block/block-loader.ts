import { Block, IBlockConstructor } from "./block.ts";

//TODO: Implementar
export class BlockLoader {
  #blocks = new Map<string, IBlockConstructor>();

  loadBlock<B extends Block>(name: string): Promise<IBlockConstructor<B>> {
    return new Promise((resolve, reject) => {
      if (this.#blocks.has(name)) {
        resolve(this.#blocks.get(name) as IBlockConstructor<B>);
      }

      reject(`Block ${name} not registered`);
    });
  }

  registerBlock(name: string, blockCtor: IBlockConstructor): this {
    this.#blocks.set(name, blockCtor);

    return this;
  }
}
