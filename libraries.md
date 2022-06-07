A `Package` is a named collection of components - Blocks, Datatypes and Interfaces - that can be used in projects.
`Package`s exist in a namespaced hierarchy, using a lowercase reverse #domain# style naming scheme such as
`org.cryptographix.payments`. The different objects defined in a package are placed within this namespace,
thus a `Block` named `EMVKernel` would be known as `org.cryptographix.payments.EMVKernel`. 

`Packages` may also contain sub-packages, such as `org.cryptographix.payments.terminal`, with multiply levels 
being allowed and defined by the package author to organize their packages as desired.

## Library Files
A library file is used to define a package, and provides details of the namespaces and components implemented within the package.
A library file may be a ES module, which exports M library file exports a map of component descriptions, generally consisting of links to ESM javascript files that 
actually implement the required functionality. 

Block, DataType or Interfaces may also defined directly within the library file, inline small code routines or blocks that represent 
sub-flows.

A library file may also specify `imports`, a map of dependencies - packages required for the correct execution of the library.

# Project Files
Projects may contain a `library` section that specifies `imports` - a list of packages required for execution of the project, 
identified by namespace. A project library may also `export` a set of 'locally' defined components used by the project.


```
type PackageLocator: URL.js | URL.json

Library {
  name: string
  
  namespace: string;

  imports: {
    "<namespace>": PackageLocator
  }

  exports: {
    "blocks": {},
    "types": {},
    "interfaces": {},

    packages: {
      "<name>": PackageLocator | Library
    }
  }
}
```

## Blocks and Packages
An `ImportDefinition` resolves to a `Package` that contains `Factory`'s for ..



## BlockFactory
A BlockFactory is responsable for loading and instantiating Blocks, performing on-demand loading of the Package(s) containing
the block implementation.


Returns a tuple: { Block, BlockHelper }.



