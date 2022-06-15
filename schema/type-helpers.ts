export class ByteArray extends Uint8Array { }

// An 'empty' interface for generic restraints
export type AnyInterface = Record<never, unknown>;

export type AnyObject = Record<string, unknown>;

// export type EmptyObject = Record<never, unknown>;
// export const EmptyObject: EmptyObject = {};

export type Writable<T> = { -readonly [P in keyof T]: T[P] };

export function Writable<T>(obj: T): Writable<T> {
  return obj;
}

// deno-lint-ignore ban-types
export type Constructable<T extends Object = {}> = {
  new(...args: unknown[]): T;
};

export type PropertiesOf<T> = Pick<
  T,
  {
    // deno-lint-ignore ban-types
    [K in keyof T]-?: T[K] extends Function ? never : K;
  }[keyof T]
>;

export type PartialPropertiesOf<T> = Pick<
  Partial<T>,
  {
    // deno-lint-ignore ban-types
    [K in keyof T]: T[K] extends Function ? never : K;
  }[keyof T]
>;

export type Nullable<T> = { [K in keyof T]: T[K] | null };


type InferType<s> = s extends "integer" ? number
  : s extends "string" ? string
  : s extends "boolean" ? boolean
  : s extends "u8[]" ? Uint8Array
  : AnyObject;

// type InnerFromProps<T> = T extends InterfacePropertyInfos<infer IFF> ? IFF
//   : never;

// export type InferTypeFromProps<PI, C> = PI extends Record<string, IPropertyInfo>
//   ? {
//     [K in keyof PI]: CondMapPropToType<PI[K], InferType<PI[K]["type"]>, C>;
//   }
//   : unknown;

// type CondMapPropToType<P, T, C> = P extends C ? T : never;

// type InTypeOf<PI> =
//   InferTypeFromProps<PI, { access: "in" }>;

export type JSONValue = string | number | boolean | null | JSONObject | JSONValue[];

export const JSONValue = {
  isUndefined(value?: JSONValue): value is undefined {
    return value === undefined;
  },

  isString(value: JSONValue): value is string {
    return typeof value === "string";
  },

  ///
  asString(value: JSONValue, defValue?: string): string | undefined {
    if (JSONValue.isString(value))
      return value;
    else if (JSONValue.isUndefined(value))
      return defValue

    throw Error(""); // TODO: error
  },

  ///
  asStringArray(value: JSONValue, defValue: string[] = []): string[] {
    if (Array.isArray(value)) {
      if (value.every((val) => typeof val === "string")) {
        return value as string[];
      }
    }
    else if (JSONValue.isUndefined(value)) {
      return defValue;
    }

    throw new Error(); //TODO: Error
  },

  isBoolean(value: JSONValue): value is boolean {
    return typeof value === "boolean";
  },

  ///
  asBoolean(value: JSONValue, defValue = false): boolean {
    if (JSONValue.isBoolean(value)) {
      return value;
    }
    else if (JSONValue.isUndefined(value))
      return defValue;

    throw Error("JSON value not a boolean");
  },


  isNumber(value: JSONValue): value is number {
    return typeof value === "number";
  },

  ///
  asNumber(value: JSONValue, defValue: number): number {
    if (JSONValue.isNumber(value)) {
      return value;
    }
    else if (JSONValue.isString(value)) {
      const num = Number.parseInt(value);

      if (!Number.isNaN(num)) return num;
    }
    else if (JSONValue.isUndefined(value))
      return defValue;

    throw Error("JSON value not a number");
  },

  ///
  isObject(value: JSONValue): value is JSONObject {
    return typeof value === "object";
  },

  asObject<OBJ = JSONObject>(value: JSONValue, defValue: OBJ): OBJ {
    if (JSONValue.isObject(value)) {
      return value as unknown as OBJ;
    }
    else if (JSONValue.isUndefined(value))
      return defValue;

    throw Error(""); // TODO: error
  },

}

export interface JSONObject {
  [x: string]: JSONValue;
}

export const JSONObject = {
  ///
  removeNullOrUndefined(obj: { [x: string]: JSONValue | undefined }): JSONObject {
    for (const x in obj) {
      if (obj[x] === undefined || obj[x] === null)
        delete obj[x];
    }

    return obj as JSONObject;
  },

  ///
  clean(obj: { [x: string]: JSONValue | undefined }): JSONObject {
    for (const propName in obj) {
      const prop = obj[propName];

      if ((prop === undefined)
        || (typeof prop == "object" && Object.keys(prop as JSONObject).length == 0)
        || (Array.isArray(prop) && prop.length == 0)
        || (typeof prop == "string" && prop.length == 0)) {
        delete obj[propName];
      }
    }

    return obj as JSONObject;
  },
}
