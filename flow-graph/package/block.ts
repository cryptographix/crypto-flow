import {
  PropertyDefinition,
  PartialPropertiesOf,
  AnyInterface,
  InterfaceDefinition,
} from "../deps.ts";

/**
 * 'Kind' of property:
 *   event     input/output signal
 *   data      data input/output
 *   config    configurable item 
 *   api       client-server api (out=client,in=server)
 *   protocol  custom protocol
 */
export type PropertyKind = "event" | "data" | "config" | "api" | "protocol";

/**
 * Direction of data-flow to/from block property attribute
 * 
 *   in        input - received by block (event/data/config/api)
 *   out       output - sent by block (event/data/config/api)
 *   bidi      bidirectional (protocol)
 */
export type PropertyFlowDirection = "none" | "in" | "out" | "in-out";

export type BlockPropertyDefinition<T = unknown> = PropertyDefinition<T> & {
  /**
   * Type of property: event/data/config/api/protocol
   */
  kind?: PropertyKind;

  /**
  * Direction of data-flow: none/in/out/bidi
  */
  direction?: PropertyFlowDirection;

  /**
   * 
   */
  view?: {
    align?: "left" | "right" | "top" | "bottom";
    order?: number;
  }
}
export type BlockPropertiesOf<BLK> = {
  [K in keyof Omit<BLK, '$helper' | 'setup' | 'teardown' | 'run' | 'ready' | 'validate'>]-?: BLK[K];
};

export type BlockPropertyDefinitions<BLK> = {
  [K in keyof BlockPropertiesOf<BLK>]-?: BlockPropertyDefinition<BLK[K]>;
};

// deno-lint-ignore no-empty-interface
export interface BlockInterfaceDefinition<BLK extends AnyInterface = AnyInterface> extends InterfaceDefinition<BlockPropertiesOf<BLK>, BlockPropertyDefinitions<BLK>> {
}

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
   * Returns true if block can be run.
   */
  ready?(): boolean | Promise<boolean>;

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
  | "code"
  | "input"
  | "output";

/**
 * BlockDefinition
 */
export interface BlockDefinition<BLK extends AnyBlock = AnyBlock> extends BlockInterfaceDefinition<BLK> {//BlockPropertiesOf<BLK>, BlockPropertyDefinitions<BLK>> {
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
