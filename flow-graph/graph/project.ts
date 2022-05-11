import { JSONObject } from "../deps.ts";
import { Graph, IGraph } from "../mod.ts";

export interface IProject<Graph extends IGraph = IGraph> {
  type: string;

  projectID: string;

  title: string;

  flows: Map<string, IGraph>;
}

export class Project implements IProject<Graph> {
  type: string;

  projectID: string;

  title: string;

  flows: Map<string, Graph>;

  constructor(project: IProject) {
    const { type, projectID, title, flows } = project;

    this.type = type;
    this.projectID = projectID;
    this.title = title;

    this.flows = new Map(
      Object.entries(flows).map(([_flowID, flow]) => [
        _flowID,
        new Graph(this, flow),
      ])
    );
  }

  getRootFlow(
    mustExist = true
  ): typeof mustExist extends true ? Graph : Graph | undefined {
    const flow = Object.values(this.flows).find((flow) => flow.type == "root");

    if (!flow && mustExist) {
      throw new Error("");
    }

    return flow;
  }

  createFlow(type: "root"|"flow", name: string): Graph {
    if (type == "root" && this.getRootFlow(false)) {
      throw new Error("");
    }

    const flow = new Graph(this, {
      id: "new flow",
      type,
      name,
      block: null,
      nodes: new Map(),
      ports: new Map(),
    });

    this.flows.set(flow.id, flow);

    return flow;
  }

  static parseProject(obj: JSONObject): Project {
    const { type = "project", title, projectID } = obj;

    const project = new Project({
      type: type as string,
      title: (title ?? "") as string,
      projectID: projectID as string,
      flows: new Map(),
    });

    Object.entries(obj.flows ?? {}).reduce((flows, item) => {
      const [id, flow] = item;

      flows.set(id, Graph.parseGraph(project, id, flow));

      return flows;
    }, project.flows);

    return project;
  }

  toObject(): JSONObject {
    const { type = "project", projectID, title } = this;

    const flows = Array.from(this.flows).reduce((flows, [flowID, flow]) => {
      flows[flowID] = flow.toObject();
      return flows;
    }, {} as JSONObject);

    return JSONObject.removeNullOrUndefined( {
      type,
      projectID,
      title,
      flows,
    } );
  }
}
