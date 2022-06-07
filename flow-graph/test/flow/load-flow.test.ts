import impProject from "../data/flow1.js";
import { checkProject, Project } from "../deps.ts";

const project = Project.parseProject(".", impProject.project);

console.log(project);

console.log(JSON.stringify(project, null, 2));

const errs = checkProject(project);

console.log(errs);
//const project = new Project(parsedProject);

const obj = project.toObject();
console.log(obj.flows);
console.log(JSON.stringify(project.toObject(), null, 2));

//const flow = Object.values(project.flows)[0];
//console.log(JSON.stringify(flow,null,2));
