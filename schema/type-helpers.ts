export class ByteArray extends Uint8Array {}

export type AnyObject = Record<string, unknown>;

export type EmptyObject = Record<never,never>;
export const EmptyObject: EmptyObject = {};

export type Writable<T> = { -readonly [P in keyof T]: T[P] };

export function Writable<T>(obj: T): Writable<T> {
  return obj;
}

// deno-lint-ignore ban-types
export type IConstructable<T extends Object = {}> = {
  new (...args: unknown[]): T;
};

export type PropertiesOf<T> = Pick<
  T,
  {
    // deno-lint-ignore ban-types
    [K in keyof T]-?: T[K] extends Function ? never : K;
  }[keyof T]
>;

export type PartialPropertiesOf<T> = Partial<Pick<
  T,
  {
    // deno-lint-ignore ban-types
    [K in keyof T]: T[K] extends Function ? never : K;
  }[keyof T]
>>;

export type Nullable<T> = {[K in keyof T]: T[K]|null};


// type InferType<s> = s extends "integer" ? number
//   : s extends "string" ? string
//   : s extends "boolean" ? boolean
//   : s extends "u8[]" ? Uint8Array
//   : {};

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

export interface JSONObject {
  [x: string]: JSONValue;
}

export const JSONObject = {
  removeNullOrUndefined(obj: JSONObject): JSONObject {
    for( const x in obj ) {
      if ( obj[x] === undefined || obj[x] === null )
        delete obj[x];
    }

    return obj;
  }
}
