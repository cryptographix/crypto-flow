## Blocks
A Block is a data processing element that transforms a set of data inputs into a different set of data values that are output from the block. Blocks are interconnected, receiving and sending data to/from other blocks.

Blocks have data Ports through which they receive or send data, and in essence, a block processes data from one or more input Ports, making the results available on one or more output Ports. Output Ports that are connected to Input Ports of other blocks transfer the data to that block. Processing blocks normally execute asynchronously whenever all required inputs have received values, thus causing data to *flow* through the network on interconnected blocks.

A Block may have a special trigger Port, which when activated causes processing to be performed, thus causing data to move synchronously through the block. 


A Block will execute when all required Inputs have received a valid value. After execution terminates, the result of processing is made available via the Block's Outputs. Any further changes to the Inputs will trigger new execution cycles, generating new outputs correspondingly.



## Inputs and Outputs
Each Input and Output has a defined shape (data-type, limits, optionality, ...) and associated metadata (name, description, ...).
Mandatory (non-optional) inputs must receive values. An optional input may declare a default value.

Inputs and Outputs each have a DataType
  Integer           "integer"
  String            "string"
  Array of Bytes    "u8[]"
  Boolean           "boolean"
  Enum              "enum"
  BigNum            "bignum"
  Slot              "slot"                A "pluggable" Slot for an enclosed Block
  Interface         Symbol -> <interface>
  

# Interfaces

A Block implements a defined interface, that is, a particular set of Inputs and Outputs. This interface can be "standard" or custom (relevant only to a specific Block). 

Standard interfaces are registered globally by name, and can optionally be associated to a "domain" or namespace.



## Block Registry

BlockRegistryEntry {

| item |  description |
|-------------|---|
  `namespace` | Optional namespace for Block
  `name` | Unique Block name within namespace
  `label` | User-friendly label
  `category` | Blocks are grouped together by category
  `colour` | Optional color 
  `icon` | Optional link to Block icon, may be an absolute URL or relative to Module path
  `description` | Block documentation in Markdown format 
  `properties` | List of named block properties (in/out/cfg), including type, data-type, optionality, default values, ... 

```





## Block types

There are different types of Blocks:
1) Processing Blocks
Classic blocks, take one or more inputs and transform them into one or more outputs. 
2) Source / Sink Blocks
3) SubFlow Blocks
4) Slottable Blocks
Blocks may declare that they implement a certain API or interface, and thus are capable if being slotted into another block.

