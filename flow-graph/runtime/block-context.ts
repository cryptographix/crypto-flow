import {
  Block,
  BlockHelper,
  Blockproperties,
  PartialBlockPropertiesOf,
  BlockFactory,
  BlockInstanceForIF,
  Node,
} from "../mod.ts";

import {
  PropertyValues,
  PropertyDataTypes,
  AnyInterface,
} from "../deps.ts";

export type BlockStatus =
  | "initialized"
  | "setup"
  | "waiting"
  | "ready"
  | "busy"
  | "done"
  | "finalized";

/**
 * BlockContext holds runtime state for a Block within a Network
 *
 * Contains a Block instance and its BlockHelper instance.
 */
export class BlockContext<IF extends AnyInterface> {
  #block: BlockInstanceForIF<IF>;

  #blockHelper: BlockHelper<Block<IF>>;

  #status: BlockStatus = "initialized";

  #lastTriggerID = 0;

  constructor(block: BlockInstanceForIF<IF>, blockHelper: BlockHelper<Block<IF>>) {
    this.#block = block;
    this.#blockHelper = blockHelper;
  }

  get block(): BlockInstanceForIF<IF> { return this.#block; }
  get blockHelper(): BlockHelper<Block<IF>> { return this.#blockHelper; }
  get properties() { return this.#blockHelper.properties; }

  resetInputs() {
    this.#blockHelper.resetInputs();
  }

  setInputs(values: Partial<PropertyValues<IF>>) {
    this.#blockHelper.inputs = values;
  }

  getOutputs(): PropertyValues<IF> {
    return this.#blockHelper.outputs as PropertyValues<IF>;
  }

  async setup(cfg: PartialBlockPropertiesOf<IF>) {
    if (this.block.setup)
      await this.block.setup(cfg);
    else
      this.blockHelper.setup(cfg);
  }

  canTrigger(triggerID?: number): boolean {

    return this.blockHelper.ready && (!triggerID || (triggerID > this.#lastTriggerID));
  }

  /**
   * Asynchronously execute a block's `process()` method
   *
   * @returns results (if any) from block processing
   */
  async trigger(triggerID: number): Promise<PropertyValues<IF>> {
    /*if (this.canTrigger(triggerID))*/ {
      await this.block.run();

      this.#lastTriggerID = triggerID;

      // done processing
      this.#blockHelper.done();

      return this.#blockHelper.outputs as PropertyValues<IF>;
    }

    //return Promise.reject("not ready to process");
  }

  teardown() {
    this.#block.teardown();

    this.#status = "finalized";
  }

  static fromNode<IF extends AnyInterface>(node: Node): Promise<BlockContext<IF>> {
    switch (node.type) {
      case "block": {
        return BlockContext.forBlockName(node.block.name!);
      }

      case "code": {
        return BlockContext.fromCodeNode(node);
      }

      case "root": case "flow": {
        /*const blockDefinition: BlockDefinition<Block<IF>> = {
          type: "flow",
          ctor: class extends AbstractBlock { run() { } },
          properties: {},
          name: node.name ?? node.id,
        }

        return Promise.resolve(BlockContext.for("", blockDefinition));*/

        break;
      }
      default: {
        // TODO: error
        break;
      }
    }

    // noop
    const bc = new BlockContext(null as unknown as BlockInstanceForIF<IF>, null as unknown as BlockHelper<BlockInstanceForIF<IF>>);

    return Promise.resolve(bc as BlockContext<IF>);
  }

  static async forBlockName<IF extends AnyInterface>(blockName: string) {
    const factory = new BlockFactory<Block<IF>>("block", blockName);

    const block = await factory.createInstance();
    return new BlockContext<IF>(block, block.$helper);
  }

  static async fromCodeNode<IF extends AnyInterface>(node: Node): Promise<BlockContext<IF>> {
    const code = node.block!.code as string;

    const properties = {} as Blockproperties<IF>;

    node.ports.forEach((port, key) => {
      properties[key as keyof Blockproperties<IF>] = {
        dataType: port.dataType as PropertyDataTypes,
        accessors: port.direction == "in" ? "set" : "get",
      } as Blockproperties<IF>[keyof Blockproperties<IF>];
    });

    const factory = new BlockFactory<Block<IF>>("code", "", code, properties);

    const block = await factory.createInstance()

    return new BlockContext<IF>(block, block.$helper) as BlockContext<IF>;
  }
}
