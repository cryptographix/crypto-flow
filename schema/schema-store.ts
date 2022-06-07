import { ISchema } from "./schema.ts";
import { Constructable } from "./type-helpers.ts";

class NullClass {}

export class SchemaStorage {
  // deno-lint-ignore ban-types
  protected items = new Map<object, ISchema>();

  public has(target: Constructable) {
    return this.items.has(target); // || !!this.findParentSchema(target);
  }

  public get<S extends ISchema>(target: Constructable): S {
    const schema = this.items.get(target); // || this.findParentSchema(target);

    if (!schema) {
      throw new Error("Cannot get schema for current target");
    }

    return schema as S;
  }

  public ensure<S extends ISchema>(
    target: Constructable,
    type = "object"
  ): S {
    let schema: ISchema;

    if (!this.items.has(target)) {
      schema = this.create(target, type);

      this.items.set(target, schema);
    } else {
      schema = this.items.get(target)!;
    }

    return schema as S;
  }

  /**
   * Creates new schema
   */
  protected create(target: Constructable, type: string): ISchema {
    // Initialize default schema
    const schema = {
      type: type,
      target: target || NullClass, // Just in case ...
      properties: {}
    };

    // Get and assign schema from parent
    /*const parentSchema = this.findParentSchema(target);
    if (parentSchema) {
      Object.assign(schema, parentSchema);
      schema.items = {};
      for (const name in parentSchema.items) {
        schema.items[name] = Object.assign({}, parentSchema.items[name]);
      }
    }*/

    // schema.target = target as any;

    return schema;
  }

  public set(target: Constructable, schema: ISchema) {
    this.items.set(target, schema);

    return this;
  }

  /*protected findParentSchema(target: object): ISchema | null {
    const parent = (target as any).__proto__;

    if (parent) {
      const schema = this.items.get(parent);
      return schema || this.findParentSchema(parent);
    }

    return null;
  }*/
}

export const schemaStore = new SchemaStorage();
