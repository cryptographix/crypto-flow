import {
  IPropertyInfo,
  PropertyValues,
  PropertiesOf,
  PropertyValue,
PartialPropertiesOf,
Schema,
NoProperties
} from "../deps.ts";

type Empty = NoProperties;
const Empty = {};

/**
 * Block is an abstract class for processing nodes, to be extended
 * in real nodes with a run() method and a set of data properties.
 *
 * Block meta-data and properties are defined by a static element
 * named `blockInfo`.
 *
 * A property may be either IN, OUT or CFG.
 *   IN: input properties that are 'set' before running
 *  OUT: output properties that can be 'get' after running
 *  CFG: configuration properties supplied at block setup time.
 * that
 */
export abstract class Block<IF = Empty> {
  /**
   * Setup `Block` using config
   */
  setup(config: PartialPropertiesOf<IF> = Empty as IF): PropertyValues<IF> | Promise<PropertyValues<IF>> {
    const propInfos = (this.constructor as IBlockConstructor<this>)?.blockInfo.propertyInfos;

    // Initialize each property from Schema information
    // Precedence:
    //   1. config parameter
    //   2. initial value from class
    //   3. "default" value from schema property.default
    //   4. the default for property type
    for( const [key, propInfo] of Object.entries(propInfos) ) {
      Schema.initPropertyFromPropertyType<PropertiesOf<Block>>(
        propInfo as IPropertyInfo<keyof PropertiesOf<Block>>,
        this,
        key as keyof PropertiesOf<Block>,
        config[key as unknown as keyof PropertiesOf<Block>] as PropertyValue,
        false );
    }

    return Empty as PropertyValues<IF>;
  }

  validate(_params: IF): boolean {
    return true;
  }

  /**
   * Execute Block login, processing input properties
   * and setting output properties.
   *
   * May execute synchronously or return a promise that
   * resolves when processing has completed.
   */
  abstract run(): void | Promise<void>;

  /**
   * Finalize block, releasing any resources
   */
  teardown(): void | Promise<void> {
    // noop
  }
}

/**
 * Block Constructor shape
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

  propertyInfos: {
    [K in keyof PropertiesOf<BLK>]-?: IPropertyInfo<BLK[K]>;
  };
}

export type BlockPropertyInfos<BLK extends Block> = IBlockInfo<BLK>["propertyInfos"];