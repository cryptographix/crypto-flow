import { IPropertyInfo } from "./property.ts";

export type InterfacePropertyInfos<IF> = {
  [K in keyof IF]-?: IPropertyInfo<IF[K]>;
};

const registeredInterfaces = new Map<
  symbol,
  // deno-lint-ignore no-explicit-any
  { name: string; namespace: string; propInfos: Record<string, IPropertyInfo<any>> }
>();

export function registerInterface<IF>(
  name: string,
  namespace: string,
  propInfos: InterfacePropertyInfos<IF>
): symbol {
  const sym = Symbol.for(`${namespace}/${name}`);

  registeredInterfaces.set(sym, {
    name,
    namespace,
    propInfos,
  });

  return sym;
}

export function getInterfaceByName<IF>(
  name: string,
  namespace?: string
): InterfacePropertyInfos<IF> {
  const iface = Array.from(registeredInterfaces.values()).find((iface) =>
    iface.name == name && namespace === undefined
      ? true
      : iface.namespace == namespace
  );

  return (iface?.propInfos ?? {}) as InterfacePropertyInfos<IF>;
}

export function getInterface<IF>(sym: symbol): InterfacePropertyInfos<IF> {
  const iface = registeredInterfaces.get(sym);

  return (iface?.propInfos ?? {}) as InterfacePropertyInfos<IF>;
}
