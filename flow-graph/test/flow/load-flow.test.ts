import impProject from "../data/flow1.js";
import { checkProject, FlowProject } from "../deps.ts";

const project = FlowProject.parseProject(".", impProject.project);

console.log(project);

console.log(JSON.stringify(project, null, 2));

const errs = checkProject(project);

console.log(errs);
//const project = new Project(parsedProject);

const obj = FlowProject.toObject(project);
console.log(obj.flows);
console.log(JSON.stringify(FlowProject.toObject(project), null, 2));

//const flow = Object.values(project.flows)[0];
//console.log(JSON.stringify(flow,null,2));
