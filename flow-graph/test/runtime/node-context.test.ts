import { NodeContext, Graph, registry, Connection, AnyObject } from "../deps.ts";
import { test, assertEquals } from "../test-harness.ts";

import { packageDefinition } from './../data/test-package-1.ts';
import impProject from "../data/flow1.js";

const _pack = registry.registerPackage(packageDefinition);

const flow = Graph.parseGraph(undefined, impProject.project.flows["invert-bit"]);
const invertorNode = new NodeContext<{ input: boolean; out?: boolean; }>("",flow.nodes.get("inverter")!);
const loggerNode = new NodeContext<{ data?: boolean; }>("",flow.nodes.get("printer")!);

const invertorPort = invertorNode.node.ports.get("out")!;

invertorNode.addOutputConnection("out", new Connection(invertorPort, invertorPort.links[0]!, loggerNode as NodeContext<AnyObject>))
// function logReadyState(text: string, trig: number) {
//   console.log(`${text} inv.ready=${invertorCtx.canTrigger(trig)} log.ready=${loggerCtx.canTrigger(trig)}`);
// }

test("Context: canTrigger states", async () => {
  
  let triggerID = 0;

  function state() {
    return [triggerID, invertorNode.context.canTrigger(triggerID), loggerNode.context.canTrigger(triggerID)]
  }

  // start with all not-ready
  assertEquals(state(), [0, false, false])

  // nextTrig, still not-ready .. no inputs yets
  triggerID++;
  assertEquals(state(), [1, false, false])

  // give invertor an input, now is ready
  invertorNode.context.setInputs({ input: true });
  assertEquals(state(), [1, true, false])

  // so trigger it, is no longer ready
  const outInv = await invertorNode.trigger(triggerID);
  // should forward to logger, must now be ready
  assertEquals(state(), [1, false, true])

  // did it output the inverted value?
  assertEquals(outInv.context.getOutputs().out, false)

  // so trigger it, is no longer ready
  const logInv = await loggerNode.trigger(triggerID);
  assertEquals(state(), [1, false, false])
  // input got cleared
  assertEquals(logInv.context.getOutputs().data, undefined);

  // next round, give invertor some more data
  triggerID++;
  invertorNode.context.setInputs({ input: false });
  assertEquals(state(), [2, true, false])

  // forget it .. no data any more
  invertorNode.context.resetInputs();
  assertEquals(state(), [2, false, false])

  // give everyone some inputs
  invertorNode.context.setInputs({ input: false });

  // ensure it didnt output the inverted value, yet
  assertEquals(outInv.context.getOutputs().out, false)
  assertEquals(state(), [2, true, false]);

  await invertorNode.trigger(triggerID);
  await loggerNode.trigger(triggerID);

  assertEquals(state(), [2, false, false]);

  assertEquals(invertorNode.context.getOutputs().out, true)
})

