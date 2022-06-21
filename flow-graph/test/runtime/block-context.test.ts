import { BlockContext, Node, registry } from "../deps.ts";
import { test, assertEquals } from "../test-harness.ts";

import { packageDefinition } from './../data/test-package-1.ts';
import impProject from "../data/flow1.js";

const _pack = registry.registerPackage(packageDefinition);

const flow = impProject.project.flows["invert-bit"];
const invertorCtx = await BlockContext.fromNode<{ input: boolean, out?: boolean }>(Node.parseNode(null, flow.nodes["inverter"]));
const loggerCtx = await BlockContext.forBlockName<{ data?: boolean }>("test.blocks.printer");

// function logReadyState(text: string, trig: number) {
//   console.log(`${text} inv.ready=${invertorCtx.canTrigger(trig)} log.ready=${loggerCtx.canTrigger(trig)}`);
// }

test("Context: canTrigger states", async () => {
  let triggerID = 0;

  function state() {
    return [triggerID, invertorCtx.canTrigger(triggerID), loggerCtx.canTrigger(triggerID)]
  }

  // start with all not-ready
  assertEquals(state(), [0, false, false])

  // nextTrig, still not-ready .. no inputs yets
  triggerID++;
  assertEquals(state(), [1, false, false])

  // give invertor an input, now is ready
  invertorCtx.setInputs({ input: true });
  assertEquals(state(), [1, true, false])

  // so trigger it, is no longer ready
  const outInv = await invertorCtx.trigger(triggerID);
  assertEquals(state(), [1, false, false])

  // did it output the inverted value?
  assertEquals(outInv.out, false)

  // forward to logger, is now ready
  loggerCtx.setInputs({ data: outInv!.out });
  assertEquals(state(), [1, false, true])

  // so trigger it, is no longer ready
  const logInv = await loggerCtx.trigger(triggerID);
  assertEquals(state(), [1, false, false])
  // input got cleared
  assertEquals(logInv.data, undefined);

  // next round, give invertor some more data
  triggerID++;
  invertorCtx.setInputs({ input: false });
  assertEquals(state(), [2, true, false])

  // forget it .. no data any more
  invertorCtx.resetInputs();
  assertEquals(state(), [2, false, false])

  // give everyone some inputs
  invertorCtx.setInputs({ input: false });
  loggerCtx.setInputs({ data: false as boolean });

  // ensure it didnt output the inverted value, yet
  assertEquals(outInv.out, false)
  assertEquals(state(), [2, true, true]);

  await invertorCtx.trigger(triggerID);
  loggerCtx.setInputs({ data: invertorCtx.block.out! as boolean });
  await loggerCtx.trigger(triggerID);

  assertEquals(state(), [2, false, false]);

  assertEquals(invertorCtx.block.out, true)
})

