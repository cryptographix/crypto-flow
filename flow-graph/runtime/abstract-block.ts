import { AnyInterface } from "../deps.ts";
import { BlockHelper, Block, HasBlockHelper, PartialBlockPropertiesOf } from "../mod.ts";

/**
 * Block is an interface for processing nodes, to be extended
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
export abstract class AbstractBlock<IF extends AnyInterface = AnyInterface> implements Block<IF>, HasBlockHelper<IF> {
  /**
   * Auto-injected Helper object
   */
  readonly $helper!: BlockHelper<Block<IF>>;

  /**
   * Setup `Block` using config
   */
  setup(config: PartialBlockPropertiesOf<IF>): void | Promise<void> {
    this.$helper.setup(config);
  }

  /**
   * Execute Block, processing input properties to generate output properties.
   *
   * May execute synchronously or return a promise that resolves once processing is complete.
   */
  abstract run(): void | Promise<void>;

  /**
   * Finalize block, releasing any resources
   */
  teardown(): void | Promise<void> {
    this.$helper.teardown();
  }
}

