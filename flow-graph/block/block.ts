import {
  IPropertyInfo,
  PropertyValues,
  PropertiesOf,
  NoProperties,
} from "../deps.ts";

export abstract class Block<IF = NoProperties> {
  /**
   * Setup `Block` using config
   */
  setup(config: Partial<IF>): void | PropertyValues | Promise<PropertyValues> {
    Object.assign(this, config);
  }

  validate(_params: IF): boolean {
    return true;
  }

  /**
   * Process input properties and set output properties
   */
  abstract process(): void | Promise<void>;

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
  new (): BLK;

  readonly blockInfo: IBlockInfo<BLK>;
}

/**
 * IBlockInfo
 */
export interface IBlockInfo<BLK extends Block = Block> {
  name: string;
  category: string;
  namespace?: string;

  propInfos: {
    [K in keyof PropertiesOf<BLK>]-?: IPropertyInfo<BLK[K]>;
  };
}
