import { Block, BlockLoader } from "../deps.ts";

let loader: BlockLoader;

export function getLoader() {
  if (loader) return loader;

  loader = new BlockLoader();

  loader.registerBlock(
    "printer",
    class extends Block {
      data?: string;

      run() {
        console.log(this.data);
      }
      static blockInfo = {
        name: "printer",
        category: "",
        propertyInfos: {
          data: { dataType: "string", accessors: "set" },
        },
      };
    }
  );

  return loader;
}

