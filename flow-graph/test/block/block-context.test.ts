import impProject from "../data/flow1.js";
import { getLoader } from "../data/test-blocks.ts";
import { BlockContext, Node } from "../deps.ts";
import { Test } from "../deps.ts";

const loader = getLoader();

const flow = impProject.project.flows["invert-bit"];
const invertorCtx = await BlockContext.fromCode(Node.parseNode("", flow.nodes["inverter"]));
const loggerCtx = await BlockContext.fromLoader(loader, "printer");

function logReadyState(text: string, trig: number) {
  console.log(`${text} inv.ready=${invertorCtx.canProcess(trig)} log.ready=${loggerCtx.canProcess(trig)}`);
}

Test.test("Context ready states", async ()=> {
  let triggerID = 0;
  logReadyState(`T=${triggerID}`, triggerID);
  triggerID++;
  logReadyState(`T=${triggerID}`, triggerID);
  
  invertorCtx.setInputs({ input: true });
  logReadyState("inv.setInput()", triggerID);
  
  const outInv = await invertorCtx.process(triggerID);
  logReadyState(`T=${triggerID}`, triggerID);
  console.log("inv.out =>", outInv);
  
  loggerCtx.setInputs({ data: outInv!.out });
  logReadyState("log.setInput()", triggerID);
  
  const logInv = await loggerCtx.process(triggerID);
  console.log("log.out =>", logInv);
  
  logReadyState("T=1", triggerID);
  triggerID++;
  logReadyState(`T=${triggerID}`, triggerID);
  loggerCtx.clearInputs();
  logReadyState("log.clearInputs()", triggerID);
})

