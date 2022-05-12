import impProject from "../data/flow1.js";
import { getLoader } from '../data/test-blocks.ts';

import { FlowRunner, Project } from "../deps.ts";

const project = Project.parseProject( impProject );
const loader = getLoader();

const runner = new FlowRunner( project.getRootFlow( true )!);

await runner.setupNetwork(loader);

runner.nodes.get('inverter')?.context.setInputs({input: true});

const _trig = runner.nextTrigger();

let block;
do {
  console.log( "triggering ...");

  block = await runner.triggerNode( );

  console.log( block?.node.id );
} while( block )


