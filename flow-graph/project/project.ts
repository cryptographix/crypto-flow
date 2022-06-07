import { JSONObject } from "../deps.ts";
import { Graph, GraphInfo, ImportDefinition } from "../mod.ts";


export interface IProject<Graph extends GraphInfo = GraphInfo> {
  type: string;

  projectID: string;

  title: string;

  flows: Map<string, GraphInfo>;

  imports: Map<string, ImportDefinition>;
}

export class Project implements IProject<Graph> {
  type: string;

  projectID: string;

  title: string;

  flows: Map<string, Graph>;

  imports: Map<string, ImportDefinition>;

  constructor(public readonly baseURL: string, project: IProject) {
    const { type, projectID, title, flows = new Map(), imports = new Map() } = project;

    this.type = type;
    this.projectID = projectID;
    this.title = title;

    this.flows = new Map(
      Object.entries(flows).map(([flowID, flow]) => [
        flowID,
        new Graph(this, flow),
      ])
    );

    this.imports = new Map(Object.entries(imports).map(([namespace, lib]) => [
      namespace,
      new ImportDefinition(namespace, lib),
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

  createFlow(type: "root" | "flow", name: string): Graph {
    if (type == "root" && this.getRootFlow(false)) {
      throw new Error("");
    }

    const flow = new Graph(this, {
      id: "new flow",
      type,
      name,
      nodes: new Map(),
      ports: new Map(),
    });

    this.flows.set(flow.id, flow);

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

      flows.set(id, Graph.parseGraph(project, id, flow));

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

  static emptyProject: IProject = Object.freeze({
    type: "",
    projectID: "",
    title: "",
    flows: new Map(),
    imports: new Map(),
  });
}
