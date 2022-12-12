import { FlowContext, FlowProject, registry, AnyInterface, PropertyValues, AnyObject } from "../deps.ts";
import { test, assertEquals } from "../test-harness.ts";

import impProject from "../data/project-1.json" assert { type: "json"};

test("Runner: Trigger sequence", async () => {
  const project = FlowProject.parseProject(Deno.cwd(), impProject);

  const runner = new FlowContext("root", FlowProject.getRootFlow(project)!);

  registry.registerPackage((await import("../data/test-package-1.ts")).packageDefinition);

  await runner.setupNetwork();

  const trigs: AnyInterface[] = [];

  /**
   * Test Project has an invertor node and a printer node.
   */

  for (const val of [true, false]) {
    runner.nodes.get("inverter")?.context.setInputs({ input: val } as PropertyValues<AnyObject>);

    const trace: (string | number)[] = [];
    trigs.push({ [val ? "true" : "false"]: trace });

    let trig = runner.nextTriggerID();
    trace.push(trig);

    //console.log("trig=", trig);

    while (trig < (val ? 2 : 4)) {
      let block;

      do {
        block = runner.nextReadyNode();

        if (block) {
          //console.log("triggering ...", block.node.id);
          trace.push(block.nodeID)

          block = await runner.triggerNode(block);
        }
      } while (block);

      trig = runner.nextTriggerID();
      trace.push(trig);
      //console.log("trig=", trig);
    }
  }

  assertEquals(JSON.stringify(trigs), '[{"true":[1,"inverter","node-2",2]},{"false":[3,"inverter","node-2",4]}]')
})