import { JSONObject } from "../deps.ts";
import { Flow, ImportDefinition } from "../mod.ts";

type ProjectType = "project" | "template" | "library";

/**
 * Base Project
 */
interface ProjectInfo {
  //
  type: ProjectType;

  //
  id: string;

  name: string;

  // 
  created?: Date;

  // 
  updated?: Date;

  //
  visibility?: "private" | "public";

  // state
  state?: "draft" | "normal";
}

/**
 * Full Project
 */
export interface FlowProject extends ProjectInfo {

  flows: Map<string, Flow>;

  imports: Map<string, ImportDefinition>;
}

export const FlowProject = {
  newFlowProject() {
    return {
      ...FlowProject.emptyProject,
      flows: {
        ...Flow.emptyFlow,
        type: "root"
      }
    }
  },

  getRootFlow(
    project: FlowProject
  ): Flow {
    const flow = Array.from(project.flows.values()).find((flow) => flow.type == "root");

    if (!flow) {
      throw new Error("No root flow");
    }

    return flow;
  },

  createFlow(project: FlowProject, type: "root" | "flow", id: string, name: string): Flow {
    if (type == "root" && FlowProject.getRootFlow(project)) {
      throw new Error("");
    }

    const flow = {
      ...Flow.emptyFlow,
      type,
      name,
      nodes: new Map(),
      ports: new Map(),
    };

    project.flows.set(id, flow);

    return flow;
  },

  parseProject(baseURL: string, obj: JSONObject): FlowProject {
    if (typeof obj["project"] == "object") {
      obj = obj["project"] as JSONObject;
    }

    const { type = "project", name = "", projectID, flows, imports } = obj;

    const project = {
      type: type as ProjectType,
      name: name as string,
      id: projectID as string,
      flows: new Map(),
      imports: new Map(),
    };

    Object.entries(flows ?? {}).reduce((flows, item) => {
      const [id, flow] = item;

      flows.set(id, Flow.parseGraph(flow));

      return flows;
    }, project.flows);

    Object.entries(imports ?? {}).reduce((imports, item) => {
      const [ns, def] = item;

      imports.set(ns, ImportDefinition.parseJSON(ns, def));

      return imports;
    }, project.imports);

    return project;
  },

  toObject(project: FlowProject): JSONObject {
    const { type = "project", id, name, flows, imports } = project;

    return JSONObject.clean({
      type,
      id,
      name,

      flows: Array.from(flows).reduce((flows, [flowID, flow]) => {
        flows[flowID] = Flow.toObject(flow);
        return flows;
      }, {} as JSONObject),

      imports: Array.from(imports).reduce((imports, [ns, def]) => {
        imports[ns] = def.toJSON();
        return imports;
      }, {} as JSONObject)
    });
  },

  emptyProject: Object.freeze({
    type: "project",
    id: "",
    name: "",
    flows: new Map([["root", Flow.emptyFlow]]),
    imports: new Map(),
  } as FlowProject),
}
/*

  //
  settings: Record<string, unknown>;
}



export interface ProjectInit<Graph extends GraphInit = GraphInit> {
  type: string;

  id: string;

  title: string;

  flows: Map<string, GraphInit>;

  imports: Map<string, ImportDefinition>;
}

export class Project implements ProjectInfo {

  constructor(public readonly baseURL: string, project: ProjectInit) {
    const { type, id, title, flows = new Map(), imports = new Map() } = project;

    this.type = type as ProjectType;
    this.id = id;
    this.name = title;

    this.flows = new Map(
      Array.from(flows.entries()).map(([flowID, flow]) => [
        flowID,
        new Flow(flow),
      ])
    );

    this.imports = new Map(Object.entries(imports).map(([namespace, lib]) => [
      namespace,
      new ImportDefinition(namespace, lib, baseURL),
    ]))
  }

  created?: Date|undefined;
  updated?: Date|undefined;
  visibility?: "private"|"public"|undefined;
  state?: "draft"|"normal"|undefined;

  getRootFlow(
    mustExist = true
  ): typeof mustExist extends true ? Flow : Flow | undefined {
    const flow = Array.from(this.flows.values()).find((flow) => flow.type == "root");

    if (!flow && mustExist) {
      throw new Error("No root flow");
    }

    return flow;
  }

  createFlow(type: "root" | "flow", id: string, name: string): Flow {
    if (type == "root" && this.getRootFlow(false)) {
      throw new Error("");
    }

    const flow = new Flow({
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
      id: projectID as string,
      flows: new Map(),
      imports: new Map(),
    });

    Object.entries(flows ?? {}).reduce((flows, item) => {
      const [id, flow] = item;

      flows.set(id, Flow.parseGraph(flow));

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
    const { type = "project", id, name, flows, imports } = this;

    return JSONObject.clean({
      type,
      id,
      name,

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
    id: "",
    title: "",
    flows: new Map([["root", Project.emptyFlow]]),
    imports: new Map(),
  });
}*/
