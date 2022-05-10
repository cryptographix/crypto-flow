import { IGraph, INode, IPort, IProject } from "../mod.ts";

export type AnyFlowError = InvalidFlowError;

export type ValidationContext = {
  project: IProject;
  flow?: IGraph;
  node?: INode;
  port?: IPort;
};

export interface InvalidFlowError extends ValidationContext {
  type: "invalid-flow";

  message: string;
}

export function checkProject(project: IProject): AnyFlowError[] {
  const context: ValidationContext = {
    project,
  };

  return Array.from(project.flows).flatMap(([_flowID, flow]) => {
    return checkFlow(flow, { ...context, flow });
  });
}

export function checkFlow(
  flow: IGraph,
  context: ValidationContext,
): AnyFlowError[] {
  let errors: AnyFlowError[] = [];

  errors = errors.concat(
    Array.from(flow.nodes).flatMap(([_nodeID, node]) => {
      return checkNode(node, { ...context, node });
    }),
  );

  errors = errors.concat(
    Array.from(flow.ports).flatMap(([_portID, port]) => {
      return checkPort(port, { ...context, port });
    }),
  );

  return errors;
}

export function checkNode(
  node: INode,
  context: ValidationContext,
): AnyFlowError[] {
  let errors: AnyFlowError[] = [];

  errors = errors.concat(
    Array.from(node.ports).flatMap(([_portID, port]) => {
      return checkPort(port, { ...context, port });
    }),
  );

  return errors;
}

export function checkPort(
  port: IPort,
  context: ValidationContext,
): AnyFlowError | AnyFlowError[] {
  let errors: AnyFlowError[] = [];

  const { flow } = context;
  const srcPort = context.port!;

  errors = errors.concat(
    port.links.flatMap((link) => {
      const destNode = flow!.nodes.get(link.nodeID);

      if (destNode === undefined) {
        return {
          type: "invalid-flow",
          ...context,
          message: `Node#${link.nodeID} not found`,
        };
      }

      const destPort = destNode.ports.get(link.portID);
      if (destPort === undefined) {
        return {
          type: "invalid-flow",
          ...context,
          message: `Port#${link.portID} not found on Node#${link.nodeID}`,
        };
      }

      if (destPort.type !== "in") {
        return {
          type: "invalid-flow",
          ...context,
          message:
            `Port#${link.portID} on Node#${link.nodeID} must be of type 'in'`,
        };
      }

      if (destPort.dataType !== srcPort.dataType) {
        return {
          type: "invalid-flow",
          ...context,
          message:
            `Port#${link.portID} on Node#${link.nodeID} must be of type '${srcPort.dataType}'`,
        };
      }

      return [];
    }),
  );

  return errors;
}
