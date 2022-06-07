import { BlockFactory } from "../../deps.ts";
import { CBCBlockCipherMode, AESBlockCipher } from "../../mod.ts";
import { test, assertEquals } from "../test-harness.ts"

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

test("AES encrypt ECB", async () => {
  const ecb = await BlockFactory.for(AESBlockCipher).createInstance();

  ecb.setup({
    direction: "encrypt",
    key: HEX.parse("01 01 01 01  0101010101 01 01 01  01010101"),
    plainText: new Uint8Array([0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
  });

  await ecb.run();
  assertEquals(ecb.cipherText, HEX.parse("88 5C 72 3A AF 8F 05 9C 04 10 2E 7E 3D 0E E6 B3"));

  //  console.log("AES-ECB(enc) = ", (await ecb.run(), HEX.toString(ecb.cipherText)))
});

test("AES encrypt/decrypt ECB", async () => {
  const ecb = await BlockFactory.for(AESBlockCipher).createInstance();
  const plainText = new Uint8Array([0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);

  ecb.setup({
    direction: "encrypt",
    key: HEX.parse("01 01 01 01  0101010101 01 01 01  01010101"),
    plainText: plainText,
  });

  await ecb.run();
  assertEquals(ecb.cipherText, HEX.parse("88 5C 72 3A AF 8F 05 9C 04 10 2E 7E 3D 0E E6 B3"));

  ecb.setup({
    direction: "decrypt",
    plainText: ecb.cipherText.slice(),
  });

  await ecb.run();
  assertEquals(ecb.cipherText, plainText);
});

test("AES-CBC encrypt/decrypt", async () => {
  const plainText = new Uint8Array(HEX.parse("8000000000000000 8000000000000000 8000000000000000 8000000000000000"));
  const cbc = await BlockFactory.for(CBCBlockCipherMode).createInstance();

  cbc.setup({
    blockCipher: await BlockFactory.for(AESBlockCipher).createInstance(),
  });
  assertEquals(cbc.blockSize, 128);

  cbc.setup({
    key: HEX.parse("01 01 01 01  0101010101 01 01 01  01010101"),
  });
  cbc.setup({
    iv: new Uint8Array(16),
  });
  cbc.setup({
    plainText: new Uint8Array(HEX.parse("8000000000000000 8000000000000000 8000000000000000 8000000000000000"))
  });


  await cbc.run();
  assertEquals(cbc.cipherText, HEX.parse("88 5C 72 3A AF 8F 05 9C 04 10 2E 7E 3D 0E E6 B3" + "41 3E 46 52 E6 63 F2 29 4F F6 60 C3 AF 1A FA FF"));

  cbc.setup({
    direction: "decrypt",
    plainText: cbc.cipherText.slice(),
  });

  await cbc.run();
  assertEquals(HEX.toString(plainText), HEX.toString(cbc.cipherText));

});