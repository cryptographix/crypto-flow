console.log("test package.js loaded")

import { AbstractBlock } from "../deps.ts";

class BLK1 extends AbstractBlock { }

export const packageDefinition = {
  namespace: "test.blocks",

  blocks: {
    printer: {
      type: "inline",
      name: "printer",
      category: "",
      propertyDefinitions: {
        data: { dataType: "string", accessors: "set" },
      },
      ctor: class extends AbstractBlock {
        data;

        run() {
          console.log(this.data);
        }
      }
    },

    printer2: {
      type: "block",
      name: "printer2",
      category: "",
      propertyDefinitions: {
        data: { dataType: "string", accessors: "set" },
      },

      ctor: class extends BLK1 {
        data;

        run() {
          console.log(this.data, this.data);
        }
      }
    }
  }
};
