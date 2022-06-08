
import { AbstractBlock, PackageDefinition } from "../deps.ts";

type IF1 = { data: string };
abstract class BLK1 extends AbstractBlock<IF1> { }

export const packageDefinition: PackageDefinition = {
  namespace: "test.blocks",

  blocks: {
    printer: {
      type: "code",
      name: "printer",
      category: "outputs",
      propertyDefinitions: {
        data: { dataType: "string", accessors: "set" },
      },
      ctor: class extends AbstractBlock<IF1> {
        data?: string;

        run() {
          console.log(this.data);
        }
      }
    },

    printer2: {
      type: "block",
      name: "printer2",
      category: "outputs",
      propertyDefinitions: {
        data: { dataType: "string", accessors: "set" },
      },

      ctor: class extends BLK1 {
        data?: string;

        run() {
          console.log(this.data, this.data);
        }
      }
    }
  }
};
