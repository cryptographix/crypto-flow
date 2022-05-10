# Blocks

A Block is a data processing element, transforming a set of Input values to Outputs, asynchronously. 

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

