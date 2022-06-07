import { packageDefinition } from './../data/test-package-1.ts';
import impProject from "../data/flow1.js";
import { BlockContext, Node, registry } from "../deps.ts";
import { Test } from "../deps.ts";

const _pack = registry.registerPackage(packageDefinition);

const flow = impProject.project.flows["invert-bit"];
const invertorCtx = await BlockContext.fromNode<{input:boolean, out?: boolean}>(Node.parseNode(null, "", flow.nodes["inverter"]));
const loggerCtx = await BlockContext.forBlockName<{data?: boolean}>("test.blocks.printer");

function logReadyState(text: string, trig: number) {
  console.log(`${text} inv.ready=${invertorCtx.canTrigger(trig)} log.ready=${loggerCtx.canTrigger(trig)}`);
}

Test.test("Context ready states", async ()=> {
  let triggerID = 0;
  logReadyState(`T=${triggerID}`, triggerID);
  triggerID++;
  logReadyState(`T=${triggerID}`, triggerID);
  
  invertorCtx.setInputs({ input: true });
  logReadyState("inv.setInput()", triggerID);
  
  const outInv = await invertorCtx.trigger(triggerID);
  logReadyState(`T=${triggerID}`, triggerID);
  console.log("inv.out =>", outInv);
  
  loggerCtx.setInputs({ data: outInv!.out });
  logReadyState("log.setInput()", triggerID);
  
  const logInv = await loggerCtx.trigger(triggerID);
  console.log("log.out =>", logInv);
  
  logReadyState("T=1", triggerID);
  triggerID++;
  logReadyState(`T=${triggerID}`, triggerID);
  loggerCtx.clearInputs();
  logReadyState("log.clearInputs()", triggerID);
})

