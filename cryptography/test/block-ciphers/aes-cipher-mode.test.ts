import { BlockFactory } from "../../deps.ts";
import { CBCBlockCipherMode } from "../../mod.ts";
import { AESBlockCipher } from "../../mod.ts";

const HEX = {
  toString: (data: Uint8Array): string => Array.from(data).map((v) => ("00" + v.toString(16)).slice(-2)).join(' ').toUpperCase(),
  parse: (hex: string): Uint8Array => {
    const bytes = [];
    hex = hex.trim();

    for (let idx = 0; idx < hex.length; idx += 2) {
      bytes.push(parseInt(hex.slice(idx, idx + 2), 16));

      while (hex[idx + 2] == ' ') ++idx;
    }

    return new Uint8Array(bytes);
  }
}

const ecb = await BlockFactory.for(AESBlockCipher).createInstance();

ecb.setup({
  direction: "encrypt",
  key: HEX.parse("01 01 01 01  0101010101 01 01 01  01010101"),
  plainText: new Uint8Array([0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
});

console.log(ecb.blockSize);
console.log("AES-ECB(enc) = ", (await ecb.run(), HEX.toString(ecb.cipherText)))
ecb.setup({
  direction: "decrypt",
  plainText: ecb.cipherText.slice(),
});
console.log("AES-ECB(dec) = ", (await ecb.run(), HEX.toString(ecb.cipherText)))

const cbc= await BlockFactory.for(CBCBlockCipherMode).createInstance();

const _k = await BlockFactory.for(AESBlockCipher).createInstance();

//_k.

cbc.setup({
  blockCipher: await BlockFactory.for(AESBlockCipher).createInstance(),
  iv: new Uint8Array(16),
  direction: "encrypt",
  key: HEX.parse("01 01 01 01  0101010101 01 01 01  01010101"),
  plainText: new Uint8Array(HEX.parse("8000000000000000 8000000000000000 8000000000000000 8000000000000000"))
});

console.log(cbc.blockSize);
console.log("AES-CBC(enc) = ", (await cbc.run(), HEX.toString(cbc.cipherText)))
cbc.setup({
  direction: "decrypt",
  plainText: cbc.cipherText.slice(),
});
console.log("AES-CBC(dec) = ", (await cbc.run(), HEX.toString(cbc.cipherText))) 
