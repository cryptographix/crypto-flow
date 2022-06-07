import { BlockFactory } from "../../deps.ts";
import { CBCBlockCipherMode } from "../../mod.ts";
import { AESBlockCipher } from "../../mod.ts";

const cbc = await BlockFactory.for(CBCBlockCipherMode).createInstance();

cbc.setup({ blockCipher: await BlockFactory.for(AESBlockCipher).createInstance(), iv: new Uint8Array(16) } );
console.log(cbc.blockSize, cbc.iv);
console.log(cbc.blockCipher.direction);
