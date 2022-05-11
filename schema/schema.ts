import { AnyObject, ByteArray, EmptyObject, IConstructable } from "./type-helpers.ts";
import { IPropertyInfo, PropertyInfos, PropertyValue } from "./property.ts";
import { schemaStore } from "./schema-store.ts";

/**
 * Base Schema descriptor for any Object
 */
export interface ISchema {
  //
  type: string;

  //
  name?: string;

  //
  description?: string;

  //
  namespace?: string;

  //
  properties: PropertyInfos;
}

/**
 * Static helpers for Schemas
 */
export abstract class Schema {
  /**
   *
   */
  static getSchemaForObject<TSchema extends ISchema>(target: {
    // deno-lint-ignore ban-types
    constructor: Function;
  }): TSchema {
    const cls = target.constructor as IConstructable;

    const schema = schemaStore.ensure<TSchema>(cls);

    return schema;
  }

  /**
   *
   */
  static getSchemaForClass<TO, TSchema extends ISchema>(
    target: IConstructable<TO>
  ): TSchema {
    const schema = schemaStore.ensure<TSchema>(target);

    return schema;
  }

  /**
   *
   */
  static initObjectFromClass<TO extends AnyObject>(
    target: IConstructable<TO>,
    initObject: Partial<TO> = EmptyObject
  ): TO {
    const schema = schemaStore.ensure<ISchema>(target);
    const obj = new target();

    // Initialize each property from Schema information
    // Precedence:
    //   1. initObject parameter
    //   2. initial value from class
    //   3. "default" value from schema property.default
    //   4. the default for property type
    Object.entries(schema.properties).forEach(([key, propInfo]) => {
      Schema.initPropertyFromPropertyType<TO>(
        propInfo,
        obj,
        key as keyof TO,
        initObject[key] as PropertyValue
      );
    });

    return obj;
  }

  static initPropertyFromPropertyType<TO extends AnyObject = EmptyObject>(
    propInfo: IPropertyInfo,
    obj: TO,
    key: keyof TO,
    initValue?: PropertyValue,
    useDefaultForType = true
  ): void {
    let value =
      initValue !== undefined
        ? initValue
        : obj[key] !== undefined
        ? obj[key]
        : propInfo.default;

    if (propInfo.dataType instanceof Object) {
      // initialize sub-object
      value = Schema.initObjectFromClass(propInfo.dataType as IConstructable<TO>, value as TO);
    } else if (value === undefined && !propInfo.optional && useDefaultForType) {
      // no initial or default value .. use default for type
      switch (propInfo.dataType) {
        case "boolean":
          value = false;
          break;

        case "integer":
          value = propInfo.minValue || 0;
          break;

        case "string":
          value = "";
          break;

        case "enum": {
          const values = Object.keys(propInfo.options);
          value = (values.length > 0 && values[0]) || "";
          break;
        }
        
        case "u8[]":
          value = ByteArray.from([]);
          break;
      }
    }

    if (value !== undefined) obj[key] = value as TO[keyof TO];
  }

  static getPropertiesForObject(
    target: AnyObject,
    filterFn?: (item: IPropertyInfo) => boolean
  ) {
    const schema = Schema.getSchemaForObject(target);

    let props = Object.entries(schema.properties);

    props = props
      .filter(([_key, propInfo]) => !propInfo.ignore)
      .filter(([_key, propInfo]) => {
        return !filterFn || filterFn(propInfo);
      });

    return new Map(props);
  }

  static getPropertiesForClass(target: IConstructable) {
    const schema = schemaStore.ensure<ISchema>(target);

    return Object.entries(schema.properties);
  }
}

/**
 * Schema descriptor that describes a serializable Object
 
export interface IObjectSchema<TO extends AnyObject = EmptyObject> extends ISchema {
  type: "object";

  serializer?: {
    // serialize to a JSON object
    toObject?(data: TO): JSONObject;

    // serialize to a byte buffer
    toBytes?(data: TO): ByteArray;

    // deserialize from a JSON object
    fromObject?(obj?: JSONObject): TO;

    // deserialize from a byte buffer
    fromBytes?(raw: ByteArray): TO;
  };
}*/
