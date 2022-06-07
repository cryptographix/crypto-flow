import { BlockFactory } from "../../deps.ts";
import { SHA1Hash } from "../../mod.ts";

const sha1 =  await BlockFactory.for(SHA1Hash).createInstance();


sha1.setup({});

const dataIn = new Array<number>(256).fill(0).map( (_,index,arr)=>arr[index] = index )
sha1.dataIn = new Uint8Array(dataIn);
//console.log(sha1.hashSize);
await sha1.run();
//console.log(sha1.hashValue);