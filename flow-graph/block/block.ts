import { IPropertyInfo } from '../deps.ts';

export interface IBlock {
  /**
   * Setup `Block` using config
   *
   * Returns hash of named input and output Ports
   */
  setup(initProperties: Partial<ThisType<this>>): void | Promise<void>;

  /**
   * Process input ports and send results to output ports
   *
   * Returns hash of altered output Ports
   */
  process(): Promise<Partial<ThisType<this>>>;

  /**
   * Finalize block and release resources
   */
  teardown?: () => void | Promise<void>;
}

export type BlockProperties<T extends IBlock> = Pick<
  T,
  {
    // deno-lint-ignore ban-types
    [K in keyof T]-?: T[K] extends Function ? never : K;
  }[keyof T]
>;


export interface IBlockConstructor<Block extends IBlock = IBlock> {
  /**
   * Block Constructor
   */
  new (): Block;

  readonly blockInfo: IBlockInfo<Block>;
}

export interface IBlockInfo<Block extends IBlock> {
  name: string;
  category: string;
  namespace?: string;

  propInfo: {
    [K in keyof BlockProperties<Block>]-?: IPropertyInfo<Block[K]>
  };
}
