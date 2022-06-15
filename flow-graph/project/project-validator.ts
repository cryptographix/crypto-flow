import { Graph, Node, PortInit } from '../mod.ts';
import { Project } from './project.ts'

export type AnyFlowError = InvalidFlowError;

export type ValidationContext = {
  project: Project;
  flow?: Graph;
  node?: Node;
  port?: PortInit;
};

export interface InvalidFlowError extends ValidationContext {
  type: "invalid-flow";

  message: string;
}

export function checkProject(project: Project): AnyFlowError[] {
  const context: ValidationContext = {
    project,
  };

  return Array.from(project.flows.entries()).flatMap(([_flowID, flow]) => {
    return checkFlow(flow, { ...context, flow });
  });
}

export function checkFlow(
  flow: Graph,
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
  node: Node,
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
  port: PortInit,
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

      if (destPort.direction !== "in") {
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
