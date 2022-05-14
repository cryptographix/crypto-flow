import impProject from "../data/flow1.js";
import { getLoader } from "../data/test-blocks.ts";
import { Block, BlockContext, Node, PropertiesOf } from "../deps.ts";
import { Test } from "../deps.ts";

const loader = getLoader();

const flow = impProject.project.flows["invert-bit"];
const invertorCtx = await BlockContext.fromCode<{input:boolean, out?: boolean}>(Node.parseNode("", flow.nodes["inverter"]));
const loggerCtx = await BlockContext.fromLoader(loader, "printer");

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

