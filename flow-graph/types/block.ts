import {
  PropertyDefinition,
  PartialPropertiesOf,
  AnyInterface,
  InterfaceDefinition,
} from "../deps.ts";

export type BlockPropertiesOf<BLK> = {
  [K in keyof Omit<BLK, '$helper' | 'setup' | 'teardown' | 'run' | 'validate'>]-?: BLK[K];
};

export type BlockPropertyDefinitions<BLK> = {
  [K in keyof BlockPropertiesOf<BLK>]-?: PropertyDefinition<BLK[K]>;
};

export interface BlockHelper<BLK extends AnyBlock> {
  //
  readonly blockDefinition: Omit<BlockDefinition<BLK>, 'ctor'>;

  //
  readonly propertyDefinitions: BlockPropertyDefinitions<BLK>;

  //
  init(initData: Partial<BlockPropertiesOf<BLK>>): void;

  //
  setup(config: Partial<BlockPropertiesOf<BLK>>): void;

  //
  teardown(): void;
}

export interface Block<IF extends AnyInterface = AnyInterface> {
  /**
   * Auto-injected Helper object
   */
  $helper: BlockHelper<Block<IF>>;

  /**
   * Setup `Block` using config
   */
  setup?(config: PartialPropertiesOf<IF>): void | Promise<void>;

  /**
   * Execute Block, processing input properties to generate output properties.
   *
   * May execute synchronously or return a promise that resolves once processing is complete.
   */
  run(): void | Promise<void>;

  /**
   * Finalize block, releasing any resources
   */
  teardown?(): void | Promise<void>;
}

export type AnyBlock = Block<AnyInterface>;

/**
 * Block Constructor shape
 */
export type BlockConstructor<BLK extends AnyBlock> = {
  new(): BLK;
};


export type BlockType =
  | "none"
  | "flow"
  | "block"
  | "inline"
  | "input"
  | "output";

/**
 * BlockDefinition
 */
export interface BlockDefinition<BLK extends AnyBlock = AnyBlock> extends InterfaceDefinition<BlockPropertiesOf<BLK>, BlockPropertyDefinitions<BLK>> {
  //
  type: BlockType;

  // class
  ctor: BlockConstructor<BLK> | (() => Promise<BLK>);

  category?: string;

  meta?: {
    iconURL?: string;
  };

  propertyDefinitions: BlockPropertyDefinitions<BLK>;
}
