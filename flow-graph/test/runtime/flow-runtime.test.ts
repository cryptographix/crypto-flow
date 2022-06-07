import impProject from "../data/project-1.json" assert { type: "json"};

import { FlowRunner, Project, registry } from "../deps.ts";

const project = Project.parseProject(Deno.cwd(), impProject);

const runner = new FlowRunner(project.getRootFlow(true)!);

registry.registerPackage((await import("../data/test-package-1.ts")).packageDefinition);

await runner.setupNetwork();

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
