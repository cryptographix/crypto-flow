import { Link, NodeContext } from "../mod.ts";

export interface FlowLogger {
  onNodeExecution(node: NodeContext): void;

  onPortOutput(node: NodeContext, portID: string, link?: Link): void;
}