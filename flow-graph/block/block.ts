import {
  IPropertyInfo,
  PropertiesOf,
  PropertyValues,
} from "../deps.ts";

export abstract class Block {
  /**
   * Setup `Block` using config
   */
  setup(
    config: PropertyValues
  ): void | IBlockInfo | Promise<IBlockInfo> {
    Object.assign(this, config);
  }

  validate( params: PropertyValues ): boolean {
    (params);

    return true; 
  }
  /**
   * Process input ports and send results to output ports
   *
   * Returns hash of altered output Ports
   */
  abstract process(
    params: PropertyValues
  ): Promise<PropertyValues> | PropertyValues;

  /**
   * Finalize block and release resources
   */
  teardown(): void | Promise<void> {
    // noop
  }
}

/**
 * Block Constructor
 */
export interface IBlockConstructor<BLK extends Block = Block> {
  new (init: PropertyValues): BLK;

  readonly blockInfo: IBlockInfo<BLK>;
}

/**
 * IBlockInfo
 */
export interface IBlockInfo<BLK extends Block = Block> {
  name: string;
  category: string;
  namespace?: string;

  propInfo: {
    [K in keyof PropertiesOf<BLK>]-?: IPropertyInfo<BLK[K]>;
  };
}
