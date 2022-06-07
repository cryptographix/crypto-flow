# Flow Networks

A network is a "executable" set of interconnected nodes, where each node either represents a block or a "sub-network" of blocks.

A network may have a set of public inputs that are wired into blocks. These blocks when executed, generate one or more outputs that feed into inputs of other blocks. A network may have a set of public outputs, that are fed from block outputs.

Node Types:
  ExecNode -> An executable Node, with setup data, in and out ports
    FlowNode -> An executable Node representing an embedded Flow
    CodeNode -> An executable Node with embedded JS/TS code
    BlockNode -> An executable Node using an external Block
  InputPort -> A public Input to a Flow
  OutputPort -> A public Output from a Flow
  DistributeNode -> send an input to multiple outputs
  SelectNode -> Selects 

  FlowNode -> contains a child Flow Network, with inputs and outputs

# Project structure
  Project
    flows: {$id: Flow}[]
      nodes: {$id: Node}[]
        ports: {$id: Port}[]
          links: {$nodeID,#portID}[]
      ports: {name,Port}[]
        links: {$nodeID,#portID}[]

  Each Node specifies the `Block` that will be executed, either via a fully-qualified name, or an inline code function.



# Loading sequence
  1. Parse JSON -> obj
  2. Parse obj -> Project / Flows / Nodes / Ports / Links, Imports
  3. Check Project, traverse tree resolving/verifying 
    - Mandatory Flow[type=main]
    - Link.target to Node, valid Port, equal DataType
    - Node[type=flow] -> Flow[type=inner] - single use?
  

# Startup
  1. Reset `BlockRegistry`
  2. Create `PackageLoader` PL for each project `Import`
     PL.load() => Promise<Package> 

