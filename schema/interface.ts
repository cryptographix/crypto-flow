import { AnyInterface, PropertiesOf } from './type-helpers.ts';
import { PropertyDefinition } from "./property.ts";

export type InterfacePropertyInfos<IF> = {
  [K in keyof IF]-?: PropertyDefinition<IF[K]>;
};

export interface InterfaceDefinition<
  IF extends AnyInterface = AnyInterface, 
  PropertyTypes extends InterfacePropertyInfos<PropertiesOf<IF>> = InterfacePropertyInfos<PropertiesOf<IF>>
> {
  //
  name: string;

  category?: string;

  namespace?: string;

  description?: string;

  propertyDefinitions: PropertyTypes;
}

// export type InterfaceSymbol<IF = AnyInterface> = InterfaceInfo<IF>;

// const registeredInterfaces = new Map<
//   ()=>InterfaceSymbol,
//   InterfaceInfo
// >();

// export function registerInterface<IF>(
//   name: string,
//   namespace: string,
//   propertyInfos: InterfacePropertyInfos<IF>
// ) {
//   //const sym = Symbol.for(`${namespace}/${name}`);
//   const key = () => {
//     return {
//       name,
//       namespace,
//       properties: propertyInfos,
//     }
//   }

//   registeredInterfaces.set(key, key());

//   return key;
// }

// export function getInterfaceByName<IF>(
//   name: string,
//   namespace?: string
// ): InterfacePropertyInfos<IF> {
//   const iface = Array.from(registeredInterfaces.values()).find((iface) =>
//     iface.name == name && namespace === undefined
//       ? true
//       : iface.namespace == namespace
//   );

//   return (iface?.properties ?? {}) as InterfacePropertyInfos<IF>;
// }

// export function getInterface<IF>(key: ()=>InterfaceSymbol): InterfacePropertyInfos<IF> {
//   const iface = registeredInterfaces.get(key);

//   return (iface?.properties ?? {}) as InterfacePropertyInfos<IF>;
// }
