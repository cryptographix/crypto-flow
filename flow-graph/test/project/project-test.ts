import proj1 from '../data/project-1.json' assert { type: "json"};
import { Project } from "../deps.ts";

//console.log(JSON.stringify(proj1, null, 2 ));

const P = Project.parseProject(Deno.cwd(), proj1);
//console.log(P.toObject());
console.log(JSON.stringify(P.toObject().imports, null, 2 ) )