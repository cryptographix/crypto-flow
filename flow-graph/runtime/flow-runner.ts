import { FlowLogger } from './flow-tracer.ts';
import { NodeContext, FlowContext, Flow, Connection } from '../mod.ts';

export type RunMode = "continuous" | "single" | "step";

/**
 * State Transitions
 * 
 * none          : new      --> initialized  |  error
 *  
 * initialized   : setup    --> error
 *                            > loading ==>  waiting | ready
 * 
 * waiting       : isReady? --> ready
 * 
 * ready         : !isStepMode --> running
 *               : STEP        --> stepping
 * 
 * stepping      : done        --> waiting | ready
 * 
 * running       : !isReady    --> waiting
 *               : PAUSE       --> paused
 * 
 * paused        : RESUME      --> running | waiting
 */
export type FlowState = "none" | "initialized" | "error" | "loading" | "waiting" | "ready" | "running" | "paused" | "stepping";

export type FlowObserver = {
  onFlowStateChange(flowState: FlowState): void;

  onFlowNodeActive(flowState: FlowState, node?: NodeContext): void;

  onFlowPortActive(node?: NodeContext, portID?: string, connection?: Connection): void;
}

export class FlowRunner {
  //
  #runMode!: RunMode;

  //
  #flowState: FlowState = "none";

  //
  #flowContext: FlowContext;

  //
  #nextReady?: NodeContext;

  // 
  #executingNode: Promise<NodeContext> | null = null;
  #stepTimer?: number;

  #executeNextNode() {
    const nextNode = this.#nextReady;

    if (!nextNode) {
      this.#setFlowState("waiting");

      console.log("No one ready")

      return null;
    }

    // execute once ..
    this.#nextReady = undefined;

    console.log("Exec", nextNode.node.name ?? nextNode.nodeID);

    const nextState = (this.isStepMode || this.isPaused) ? "stepping" : "running";

    this.#setFlowState(nextState);

    this.flowObserver?.onFlowNodeActive(nextState, nextNode);
    this.flowObserver?.onFlowPortActive(nextNode);

    this.#executingNode = this.#flowContext.triggerNode(nextNode)!.then((node) => {

      this.#executingNode = null;

      for (const [portID, _port] of node.node.ports) {
        node.getOutputConnectionsForPort(portID).forEach(con => {
          this.flowObserver?.onFlowPortActive(node, portID, con);
        });
      }

      return new Promise((resolve, _reject) => {
        setTimeout(() => {
          // look for next ready mode
          this.isReady();

          resolve(node);
        }, 350);
      });
    });

    return this.#executingNode;
  }

  async #stepFlowAndRepeat() {
    // any node ready to execute?
    if (this.isReady()) {
      // run the node ...
      const executingNode = this.#executeNextNode();

      // wait for node to execute ...
      await executingNode;

      // can we repeat?  aborted? (pause/stop buttons)
      if (this.#flowState == "running") {

        // set timer to execute next step
        this.#stepTimer = setTimeout(() => {
          this.#stepTimer = undefined;

          if (this.#flowState == "running")
            this.#stepFlowAndRepeat();
        }, 350)
      }
    }
    else {
      // No more ready nodes
      this.#setFlowState("waiting");
    }
  }

  #setFlowState(newState: FlowState) {
    if (this.#flowState != newState) {
      this.#flowState = newState;

      console.log("FlowState <=", newState)
      this.flowObserver?.onFlowStateChange(newState);
    }
  }

  constructor(public readonly flowObserver?: FlowObserver) {
    this.#flowContext = new FlowContext("root", Flow.emptyFlow);

    this.#setFlowState("initialized");
  }

  //get runner() { return this.#flowContext; }

  async setup(mode: RunMode, flowID: string, flow: Flow) {
    this.#runMode = mode;

    // kill any existing flow
    if ( this.#flowState != "none") {
      await this.teardown();
    }

    this.#flowContext = new FlowContext(flowID, flow);

    await this.#flowContext.setupNetwork();

    this.#setFlowState("initialized");
  }

  async resetFlow() {
    this.#nextReady = undefined;

    this.pauseFlow(true);

    if (this.#flowState == "initialized")
      this.#setFlowState("loading");

    this.flowObserver?.onFlowNodeActive(this.#flowState);
    this.flowObserver?.onFlowPortActive();

    try {
      await this.#flowContext.setupNetwork();

      if (this.#flowState !== "paused")
        this.isReady();
    }
    catch (e) {
      console.log("Error setting up network", e)

      this.#setFlowState("error");
    }
  }

  get isBusy() { return this.#executingNode !== null; }
  get isPaused() { return this.#flowState == "paused" || this.#flowState == "stepping" }
  get isRunning() { return this.#flowState == "running"; }

  get isContinuousMode() { return this.#runMode === "continuous"; }
  get isSingleMode() { return this.#runMode === "single"; }
  get isStepMode() { return this.#runMode === "step"; }

  triggerFlow() {
    const triggerID = this.#flowContext.nextTriggerID();
    console.log("Trigger", triggerID);

    if ((this.#flowState != "paused") && this.isReady()) {
      if (!this.isStepMode) {
        this.runFlow();
      }
    }
  }

  isReady() {
    if (this.#nextReady === undefined) {
      const nextReady = this.#nextReady = this.#flowContext.nextReadyNode(this.isContinuousMode);

      const nextState: FlowState = this.isStepMode ? "ready" : (this.isPaused) ? "paused" : "running";

      if (nextReady) {
        this.flowObserver?.onFlowNodeActive(nextState, nextReady);
        this.flowObserver?.onFlowPortActive(nextReady);

        this.#setFlowState(nextState);
      }
    }

    const isReady = this.#nextReady !== undefined;
    if (!isReady) {
      this.#setFlowState("waiting");

      this.flowObserver?.onFlowNodeActive("waiting");
      this.flowObserver?.onFlowPortActive();
    }

    return isReady;
  }

  stepFlow(): Promise<NodeContext> | null {
    if (!this.#nextReady) {
      this.#setFlowState("waiting");

      console.log("No one ready")

      return null;
    }

    return this.#executeNextNode();
  }

  runFlow() {
    if (!this.isStepMode) {
      this.#setFlowState("running");

      return this.#stepFlowAndRepeat();
    }
    else {
      console.log("Should never happen");

      this.stepFlow();
    }
  }

  async pauseFlow(stop = false) {
    if (this.#stepTimer) {
      clearTimeout(this.#stepTimer);
      this.#stepTimer = undefined;
    }

    await this.#executingNode;

    this.#executingNode = null;

    if (!this.isStepMode && !stop) {
      this.#setFlowState("paused");
    }
  }

  async teardown() {
    await this.pauseFlow();

    this.#flowContext.teardownNetwork();

    this.#flowContext = new FlowContext("", Flow.emptyFlow);
  }
}
