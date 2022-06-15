import { JSONObject } from "../deps.ts";
import { Graph, GraphInit, ImportDefinition } from "../mod.ts";


export interface ProjectInit<Graph extends GraphInit = GraphInit> {
  type: string;

  projectID: string;

  title: string;

  flows: Map<string, GraphInit>;

  imports: Map<string, ImportDefinition>;
}

export class Project implements ProjectInit<Graph> {
  type: string;

  projectID: string;

  title: string;

  flows: Map<string, Graph>;

  imports: Map<string, ImportDefinition>;

  constructor(public readonly baseURL: string, project: ProjectInit) {
    const { type, projectID, title, flows = new Map(), imports = new Map() } = project;

    this.type = type;
    this.projectID = projectID;
    this.title = title;

    this.flows = new Map(
      Array.from(flows.entries()).map(([flowID, flow]) => [
        flowID,
        new Graph(this, flow),
      ])
    );

    this.imports = new Map(Object.entries(imports).map(([namespace, lib]) => [
      namespace,
      new ImportDefinition(namespace, lib, baseURL),
    ]))
  }

  getRootFlow(
    mustExist = true
  ): typeof mustExist extends true ? Graph : Graph | undefined {
    const flow = Array.from(this.flows.values()).find((flow) => flow.type == "root");

    if (!flow && mustExist) {
      throw new Error("No root flow");
    }

    return flow;
  }

  createFlow(type: "root" | "flow", id: string, name: string): Graph {
    if (type == "root" && this.getRootFlow(false)) {
      throw new Error("");
    }

    const flow = new Graph(this, {
      type,
      name,
      nodes: new Map(),
      ports: new Map(),
    });

    this.flows.set(id, flow);

    return flow;
  }

  static parseProject(baseURL: string, obj: JSONObject): Project {
    if (typeof obj["project"] == "object") {
      obj = obj["project"] as JSONObject;
    }

    const { type = "project", title = "", projectID, flows, imports } = obj;

    const project = new Project(baseURL, {
      type: type as string,
      title: title as string,
      projectID: projectID as string,
      flows: new Map(),
      imports: new Map(),
    });

    Object.entries(flows ?? {}).reduce((flows, item) => {
      const [id, flow] = item;

      flows.set(id, Graph.parseGraph(project, flow));

      return flows;
    }, project.flows);

    Object.entries(imports ?? {}).reduce((imports, item) => {
      const [ns, def] = item;

      imports.set(ns, ImportDefinition.parseJSON(ns, def));

      return imports;
    }, project.imports);

    return project;
  }

  toObject(): JSONObject {
    const { type = "project", projectID, title, flows, imports } = this;

    return JSONObject.removeNullOrUndefined({
      type,
      projectID,
      title,

      flows: Array.from(flows).reduce((flows, [flowID, flow]) => {
        flows[flowID] = flow.toObject();
        return flows;
      }, {} as JSONObject),

      imports: Array.from(imports).reduce((imports, [ns, def]) => {
        imports[ns] = def.toJSON();
        return imports;
      }, {} as JSONObject)
    });
  }

  static emptyFlow: GraphInit = Object.freeze({
    type:"root",

    id: "",

    nodes: new Map(),
    ports: new Map(),
  });
  static emptyProject: ProjectInit = Object.freeze({
    type: "",
    projectID: "",
    title: "",
    flows: new Map([["root", Project.emptyFlow]]),
    imports: new Map(),
  });
}
