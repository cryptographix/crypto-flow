import impProject from "../data/flow1.json" assert { type: "json"};
import { getLoader } from "../data/test-blocks.ts";

import { FlowRunner, Project } from "../deps.ts";

const project = Project.parseProject(impProject);
const loader = getLoader();

const runner = new FlowRunner(project.getRootFlow(true)!);

await runner.setupNetwork(loader);

for (const val of [true, false]) {
  runner.nodes.get("inverter")?.context.setInputs({ input: val } as Record<string,unknown> );

  let trig = runner.nextTriggerID();
  console.log("trig=", trig);
  while (trig < (val ? 2 : 4)) {
    let block;

    do {
      block = runner.nextReadyNode();

      if (block) {
        console.log("triggering ...", block.node.id);

        block = await runner.triggerNode(block);
      }
    } while (block);

    trig = runner.nextTriggerID();
    console.log("trig=", trig);
  }
}
