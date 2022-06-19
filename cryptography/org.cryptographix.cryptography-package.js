// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

const IFBlockCipher = {
    name: "IFBlockCipher",
    propertyDefinitions: {
        direction: {
            accessors: "both",
            dataType: "enum",
            default: "encrypt",
            options: [
                "encrypt",
                "decrypt"
            ]
        },
        plainText: {
            accessors: "set",
            dataType: "u8[]"
        },
        key: {
            accessors: "set",
            dataType: "u8[]"
        },
        blockSize: {
            accessors: "get",
            dataType: "integer"
        },
        cipherText: {
            accessors: "get",
            dataType: "u8[]"
        }
    }
};
export { IFBlockCipher as IFBlockCipher };
class CBCCipherModeBlock {
    $helper;
    blockCipher;
    direction = "encrypt";
    key;
    plainText;
    iv;
    blockSize;
    cipherText;
    setup(config) {
        const { key , direction  } = config;
        this.$helper.setup(config);
        if (this.blockCipher) {
            const blockCipher = this.blockCipher;
            blockCipher.setup({
                direction,
                key
            });
            this.blockSize = blockCipher.blockSize;
        }
    }
    async run() {
        const { direction , plainText , blockSize , blockCipher  } = this;
        const chainVec = this.iv.slice();
        const blockLength = blockSize / 8;
        blockCipher.direction = direction;
        const cipherText = new Uint8Array(plainText.length);
        for(let i = 0; i < plainText.length; i += blockLength){
            const block = blockCipher.plainText = plainText.slice(i, i + blockLength);
            if (direction == "encrypt") {
                for(let j = 0; j < blockLength; ++j){
                    block[j] = block[j] ^ chainVec[j];
                }
                await blockCipher.run();
                chainVec.set(blockCipher.cipherText);
            } else {
                await blockCipher.run();
                for(let j = 0; j < blockLength; ++j){
                    blockCipher.cipherText[j] = blockCipher.cipherText[j] ^ chainVec[j];
                }
                chainVec.set(block);
            }
            cipherText.set(blockCipher.cipherText, i);
        }
        this.cipherText = cipherText;
    }
    teardown() {}
}
const CBCBlockCipherMode = {
    type: "block",
    ctor: CBCCipherModeBlock,
    name: "CBC Block Cipher Mode",
    category: "crypto",
    propertyDefinitions: {
        ...IFBlockCipher.propertyDefinitions,
        blockCipher: {
            dataType: "slot",
            accessors: "both"
        },
        iv: {
            dataType: "u8[]",
            accessors: "set",
            minLength: 16,
            maxLength: 16
        }
    }
};
export { CBCBlockCipherMode as CBCBlockCipherMode };
const AES_BLOCK_BYTES = 16;
class AESBlockCipherBlock {
    $helper;
    direction = "encrypt";
    #cryptoKey;
    set key(key) {
        this.#cryptoKey = crypto.subtle.importKey("raw", key, "AES-CBC", true, [
            "encrypt",
            "decrypt"
        ]);
    }
    blockSize = 128;
    plainText;
    cipherText;
    async run() {
        const { plainText  } = this;
        const len = plainText.length;
        const iv = new Uint8Array(16);
        const cryptoKey = await this.#cryptoKey;
        if (this.direction == "encrypt") this.cipherText = new Uint8Array(await crypto.subtle.encrypt({
            name: "AES-CBC",
            iv: iv
        }, cryptoKey, plainText)).slice(0, len);
        else {
            const len = plainText.length;
            const plain = new Uint8Array(len + 16);
            plain.set(plainText);
            const fake = new Uint8Array(16);
            for(let i = 0; i < 16; ++i)fake[i] = plain[len - AES_BLOCK_BYTES + i] ^ 0x10;
            const fakeDecrypted = await crypto.subtle.encrypt({
                name: "AES-CBC",
                iv: new Uint8Array(16)
            }, cryptoKey, fake);
            plain.set(new Uint8Array(fakeDecrypted).slice(0, 16), len);
            this.cipherText = new Uint8Array(await crypto.subtle.decrypt({
                name: "AES-CBC",
                iv: iv
            }, cryptoKey, plain)).slice(0, len);
        }
        return Promise.resolve();
    }
}
const AESBlockCipher = {
    type: "block",
    ctor: AESBlockCipherBlock,
    name: "AES Block Cipher",
    category: "crypto",
    propertyDefinitions: {
        ...IFBlockCipher.propertyDefinitions,
        key: {
            ...IFBlockCipher.propertyDefinitions.key,
            dataType: "u8[]",
            minLength: 16,
            maxLength: 32,
            lengthStep: 8
        },
        blockSize: {
            ...IFBlockCipher.propertyDefinitions.blockSize,
            default: 128,
            constant: true
        }
    }
};
export { AESBlockCipher as AESBlockCipher };
class DESBlockCipherBlock {
    $helper;
    direction = "encrypt";
    key;
    blockSize;
    plainText;
    cipherText;
    run() {
        const { key , plainText , direction  } = this;
        if (direction === "encrypt") {
            this.cipherText = des(key, plainText, 1, 0, undefined, 4);
        } else {
            this.cipherText = des(key, plainText, 0, 0, undefined, 4);
        }
    }
}
const desSP = {
    spfunction1: new Uint32Array([
        0x1010400,
        0,
        0x10000,
        0x1010404,
        0x1010004,
        0x10404,
        0x4,
        0x10000,
        0x400,
        0x1010400,
        0x1010404,
        0x400,
        0x1000404,
        0x1010004,
        0x1000000,
        0x4,
        0x404,
        0x1000400,
        0x1000400,
        0x10400,
        0x10400,
        0x1010000,
        0x1010000,
        0x1000404,
        0x10004,
        0x1000004,
        0x1000004,
        0x10004,
        0,
        0x404,
        0x10404,
        0x1000000,
        0x10000,
        0x1010404,
        0x4,
        0x1010000,
        0x1010400,
        0x1000000,
        0x1000000,
        0x400,
        0x1010004,
        0x10000,
        0x10400,
        0x1000004,
        0x400,
        0x4,
        0x1000404,
        0x10404,
        0x1010404,
        0x10004,
        0x1010000,
        0x1000404,
        0x1000004,
        0x404,
        0x10404,
        0x1010400,
        0x404,
        0x1000400,
        0x1000400,
        0,
        0x10004,
        0x10400,
        0,
        0x1010004
    ]),
    spfunction2: new Uint32Array([
        -0x7fef7fe0,
        -0x7fff8000,
        0x8000,
        0x108020,
        0x100000,
        0x20,
        -0x7fefffe0,
        -0x7fff7fe0,
        -0x7fffffe0,
        -0x7fef7fe0,
        -0x7fef8000,
        -0x80000000,
        -0x7fff8000,
        0x100000,
        0x20,
        -0x7fefffe0,
        0x108000,
        0x100020,
        -0x7fff7fe0,
        0,
        -0x80000000,
        0x8000,
        0x108020,
        -0x7ff00000,
        0x100020,
        -0x7fffffe0,
        0,
        0x108000,
        0x8020,
        -0x7fef8000,
        -0x7ff00000,
        0x8020,
        0,
        0x108020,
        -0x7fefffe0,
        0x100000,
        -0x7fff7fe0,
        -0x7ff00000,
        -0x7fef8000,
        0x8000,
        -0x7ff00000,
        -0x7fff8000,
        0x20,
        -0x7fef7fe0,
        0x108020,
        0x20,
        0x8000,
        -0x80000000,
        0x8020,
        -0x7fef8000,
        0x100000,
        -0x7fffffe0,
        0x100020,
        -0x7fff7fe0,
        -0x7fffffe0,
        0x100020,
        0x108000,
        0,
        -0x7fff8000,
        0x8020,
        -0x80000000,
        -0x7fefffe0,
        -0x7fef7fe0,
        0x108000
    ]),
    spfunction3: new Uint32Array([
        0x208,
        0x8020200,
        0,
        0x8020008,
        0x8000200,
        0,
        0x20208,
        0x8000200,
        0x20008,
        0x8000008,
        0x8000008,
        0x20000,
        0x8020208,
        0x20008,
        0x8020000,
        0x208,
        0x8000000,
        0x8,
        0x8020200,
        0x200,
        0x20200,
        0x8020000,
        0x8020008,
        0x20208,
        0x8000208,
        0x20200,
        0x20000,
        0x8000208,
        0x8,
        0x8020208,
        0x200,
        0x8000000,
        0x8020200,
        0x8000000,
        0x20008,
        0x208,
        0x20000,
        0x8020200,
        0x8000200,
        0,
        0x200,
        0x20008,
        0x8020208,
        0x8000200,
        0x8000008,
        0x200,
        0,
        0x8020008,
        0x8000208,
        0x20000,
        0x8000000,
        0x8020208,
        0x8,
        0x20208,
        0x20200,
        0x8000008,
        0x8020000,
        0x8000208,
        0x208,
        0x8020000,
        0x20208,
        0x8,
        0x8020008,
        0x20200
    ]),
    spfunction4: new Uint32Array([
        0x802001,
        0x2081,
        0x2081,
        0x80,
        0x802080,
        0x800081,
        0x800001,
        0x2001,
        0,
        0x802000,
        0x802000,
        0x802081,
        0x81,
        0,
        0x800080,
        0x800001,
        0x1,
        0x2000,
        0x800000,
        0x802001,
        0x80,
        0x800000,
        0x2001,
        0x2080,
        0x800081,
        0x1,
        0x2080,
        0x800080,
        0x2000,
        0x802080,
        0x802081,
        0x81,
        0x800080,
        0x800001,
        0x802000,
        0x802081,
        0x81,
        0,
        0,
        0x802000,
        0x2080,
        0x800080,
        0x800081,
        0x1,
        0x802001,
        0x2081,
        0x2081,
        0x80,
        0x802081,
        0x81,
        0x1,
        0x2000,
        0x800001,
        0x2001,
        0x802080,
        0x800081,
        0x2001,
        0x2080,
        0x800000,
        0x802001,
        0x80,
        0x800000,
        0x2000,
        0x802080
    ]),
    spfunction5: new Uint32Array([
        0x100,
        0x2080100,
        0x2080000,
        0x42000100,
        0x80000,
        0x100,
        0x40000000,
        0x2080000,
        0x40080100,
        0x80000,
        0x2000100,
        0x40080100,
        0x42000100,
        0x42080000,
        0x80100,
        0x40000000,
        0x2000000,
        0x40080000,
        0x40080000,
        0,
        0x40000100,
        0x42080100,
        0x42080100,
        0x2000100,
        0x42080000,
        0x40000100,
        0,
        0x42000000,
        0x2080100,
        0x2000000,
        0x42000000,
        0x80100,
        0x80000,
        0x42000100,
        0x100,
        0x2000000,
        0x40000000,
        0x2080000,
        0x42000100,
        0x40080100,
        0x2000100,
        0x40000000,
        0x42080000,
        0x2080100,
        0x40080100,
        0x100,
        0x2000000,
        0x42080000,
        0x42080100,
        0x80100,
        0x42000000,
        0x42080100,
        0x2080000,
        0,
        0x40080000,
        0x42000000,
        0x80100,
        0x2000100,
        0x40000100,
        0x80000,
        0,
        0x40080000,
        0x2080100,
        0x40000100
    ]),
    spfunction6: new Uint32Array([
        0x20000010,
        0x20400000,
        0x4000,
        0x20404010,
        0x20400000,
        0x10,
        0x20404010,
        0x400000,
        0x20004000,
        0x404010,
        0x400000,
        0x20000010,
        0x400010,
        0x20004000,
        0x20000000,
        0x4010,
        0,
        0x400010,
        0x20004010,
        0x4000,
        0x404000,
        0x20004010,
        0x10,
        0x20400010,
        0x20400010,
        0,
        0x404010,
        0x20404000,
        0x4010,
        0x404000,
        0x20404000,
        0x20000000,
        0x20004000,
        0x10,
        0x20400010,
        0x404000,
        0x20404010,
        0x400000,
        0x4010,
        0x20000010,
        0x400000,
        0x20004000,
        0x20000000,
        0x4010,
        0x20000010,
        0x20404010,
        0x404000,
        0x20400000,
        0x404010,
        0x20404000,
        0,
        0x20400010,
        0x10,
        0x4000,
        0x20400000,
        0x404010,
        0x4000,
        0x400010,
        0x20004010,
        0,
        0x20404000,
        0x20000000,
        0x400010,
        0x20004010
    ]),
    spfunction7: new Uint32Array([
        0x200000,
        0x4200002,
        0x4000802,
        0,
        0x800,
        0x4000802,
        0x200802,
        0x4200800,
        0x4200802,
        0x200000,
        0,
        0x4000002,
        0x2,
        0x4000000,
        0x4200002,
        0x802,
        0x4000800,
        0x200802,
        0x200002,
        0x4000800,
        0x4000002,
        0x4200000,
        0x4200800,
        0x200002,
        0x4200000,
        0x800,
        0x802,
        0x4200802,
        0x200800,
        0x2,
        0x4000000,
        0x200800,
        0x4000000,
        0x200800,
        0x200000,
        0x4000802,
        0x4000802,
        0x4200002,
        0x4200002,
        0x2,
        0x200002,
        0x4000000,
        0x4000800,
        0x200000,
        0x4200800,
        0x802,
        0x200802,
        0x4200800,
        0x802,
        0x4000002,
        0x4200802,
        0x4200000,
        0x200800,
        0,
        0x2,
        0x4200802,
        0,
        0x200802,
        0x4200000,
        0x800,
        0x4000002,
        0x4000800,
        0x800,
        0x200002
    ]),
    spfunction8: new Uint32Array([
        0x10001040,
        0x1000,
        0x40000,
        0x10041040,
        0x10000000,
        0x10001040,
        0x40,
        0x10000000,
        0x40040,
        0x10040000,
        0x10041040,
        0x41000,
        0x10041000,
        0x41040,
        0x1000,
        0x40,
        0x10040000,
        0x10000040,
        0x10001000,
        0x1040,
        0x41000,
        0x40040,
        0x10040040,
        0x10041000,
        0x1040,
        0,
        0,
        0x10040040,
        0x10000040,
        0x10001000,
        0x41040,
        0x40000,
        0x41040,
        0x40000,
        0x10041000,
        0x1000,
        0x40,
        0x10040040,
        0x1000,
        0x41040,
        0x10001000,
        0x40,
        0x10000040,
        0x10040000,
        0x10040040,
        0x10000000,
        0x40000,
        0x10001040,
        0,
        0x10041040,
        0x40040,
        0x10000040,
        0x10040000,
        0x10001000,
        0x10001040,
        0,
        0x10041040,
        0x41000,
        0x41000,
        0x1040,
        0x1040,
        0x40040,
        0x10000000,
        0x10041000
    ])
};
const desPC = {
    pc2bytes0: new Uint32Array([
        0,
        0x4,
        0x20000000,
        0x20000004,
        0x10000,
        0x10004,
        0x20010000,
        0x20010004,
        0x200,
        0x204,
        0x20000200,
        0x20000204,
        0x10200,
        0x10204,
        0x20010200,
        0x20010204
    ]),
    pc2bytes1: new Uint32Array([
        0,
        0x1,
        0x100000,
        0x100001,
        0x4000000,
        0x4000001,
        0x4100000,
        0x4100001,
        0x100,
        0x101,
        0x100100,
        0x100101,
        0x4000100,
        0x4000101,
        0x4100100,
        0x4100101
    ]),
    pc2bytes2: new Uint32Array([
        0,
        0x8,
        0x800,
        0x808,
        0x1000000,
        0x1000008,
        0x1000800,
        0x1000808,
        0,
        0x8,
        0x800,
        0x808,
        0x1000000,
        0x1000008,
        0x1000800,
        0x1000808
    ]),
    pc2bytes3: new Uint32Array([
        0,
        0x200000,
        0x8000000,
        0x8200000,
        0x2000,
        0x202000,
        0x8002000,
        0x8202000,
        0x20000,
        0x220000,
        0x8020000,
        0x8220000,
        0x22000,
        0x222000,
        0x8022000,
        0x8222000
    ]),
    pc2bytes4: new Uint32Array([
        0,
        0x40000,
        0x10,
        0x40010,
        0,
        0x40000,
        0x10,
        0x40010,
        0x1000,
        0x41000,
        0x1010,
        0x41010,
        0x1000,
        0x41000,
        0x1010,
        0x41010
    ]),
    pc2bytes5: new Uint32Array([
        0,
        0x400,
        0x20,
        0x420,
        0,
        0x400,
        0x20,
        0x420,
        0x2000000,
        0x2000400,
        0x2000020,
        0x2000420,
        0x2000000,
        0x2000400,
        0x2000020,
        0x2000420
    ]),
    pc2bytes6: new Uint32Array([
        0,
        0x10000000,
        0x80000,
        0x10080000,
        0x2,
        0x10000002,
        0x80002,
        0x10080002,
        0,
        0x10000000,
        0x80000,
        0x10080000,
        0x2,
        0x10000002,
        0x80002,
        0x10080002
    ]),
    pc2bytes7: new Uint32Array([
        0,
        0x10000,
        0x800,
        0x10800,
        0x20000000,
        0x20010000,
        0x20000800,
        0x20010800,
        0x20000,
        0x30000,
        0x20800,
        0x30800,
        0x20020000,
        0x20030000,
        0x20020800,
        0x20030800
    ]),
    pc2bytes8: new Uint32Array([
        0,
        0x40000,
        0,
        0x40000,
        0x2,
        0x40002,
        0x2,
        0x40002,
        0x2000000,
        0x2040000,
        0x2000000,
        0x2040000,
        0x2000002,
        0x2040002,
        0x2000002,
        0x2040002
    ]),
    pc2bytes9: new Uint32Array([
        0,
        0x10000000,
        0x8,
        0x10000008,
        0,
        0x10000000,
        0x8,
        0x10000008,
        0x400,
        0x10000400,
        0x408,
        0x10000408,
        0x400,
        0x10000400,
        0x408,
        0x10000408
    ]),
    pc2bytes10: new Uint32Array([
        0,
        0x20,
        0,
        0x20,
        0x100000,
        0x100020,
        0x100000,
        0x100020,
        0x2000,
        0x2020,
        0x2000,
        0x2020,
        0x102000,
        0x102020,
        0x102000,
        0x102020
    ]),
    pc2bytes11: new Uint32Array([
        0,
        0x1000000,
        0x200,
        0x1000200,
        0x200000,
        0x1200000,
        0x200200,
        0x1200200,
        0x4000000,
        0x5000000,
        0x4000200,
        0x5000200,
        0x4200000,
        0x5200000,
        0x4200200,
        0x5200200
    ]),
    pc2bytes12: new Uint32Array([
        0,
        0x1000,
        0x8000000,
        0x8001000,
        0x80000,
        0x81000,
        0x8080000,
        0x8081000,
        0x10,
        0x1010,
        0x8000010,
        0x8001010,
        0x80010,
        0x81010,
        0x8080010,
        0x8081010
    ]),
    pc2bytes13: new Uint32Array([
        0,
        0x4,
        0x100,
        0x104,
        0,
        0x4,
        0x100,
        0x104,
        0x1,
        0x5,
        0x101,
        0x105,
        0x1,
        0x5,
        0x101,
        0x105
    ])
};
function des_createKeys(key) {
    const iterations = key.length > 8 ? 3 : 1;
    const keys = new Uint32Array(32 * iterations);
    const shifts = [
        0,
        0,
        1,
        1,
        1,
        1,
        1,
        1,
        0,
        1,
        1,
        1,
        1,
        1,
        1,
        0
    ];
    let lefttemp, righttemp, m = 0, n = 0;
    for(let j = 0; j < iterations; j++){
        let left = key[m++] << 24 | key[m++] << 16 | key[m++] << 8 | key[m++];
        let right = key[m++] << 24 | key[m++] << 16 | key[m++] << 8 | key[m++];
        let temp = (left >>> 4 ^ right) & 0x0f0f0f0f;
        right ^= temp;
        left ^= temp << 4;
        temp = (right >>> -16 ^ left) & 0x0000ffff;
        left ^= temp;
        right ^= temp << -16;
        temp = (left >>> 2 ^ right) & 0x33333333;
        right ^= temp;
        left ^= temp << 2;
        temp = (right >>> -16 ^ left) & 0x0000ffff;
        left ^= temp;
        right ^= temp << -16;
        temp = (left >>> 1 ^ right) & 0x55555555;
        right ^= temp;
        left ^= temp << 1;
        temp = (right >>> 8 ^ left) & 0x00ff00ff;
        left ^= temp;
        right ^= temp << 8;
        temp = (left >>> 1 ^ right) & 0x55555555;
        right ^= temp;
        left ^= temp << 1;
        temp = left << 8 | right >>> 20 & 0x000000f0;
        left = right << 24 | right << 8 & 0xff0000 | right >>> 8 & 0xff00 | right >>> 24 & 0xf0;
        right = temp;
        for(let i = 0; i < shifts.length; i++){
            if (shifts[i]) {
                left = left << 2 | left >>> 26;
                right = right << 2 | right >>> 26;
            } else {
                left = left << 1 | left >>> 27;
                right = right << 1 | right >>> 27;
            }
            left &= -0xf;
            right &= -0xf;
            lefttemp = desPC.pc2bytes0[left >>> 28] | desPC.pc2bytes1[left >>> 24 & 0xf] | desPC.pc2bytes2[left >>> 20 & 0xf] | desPC.pc2bytes3[left >>> 16 & 0xf] | desPC.pc2bytes4[left >>> 12 & 0xf] | desPC.pc2bytes5[left >>> 8 & 0xf] | desPC.pc2bytes6[left >>> 4 & 0xf];
            righttemp = desPC.pc2bytes7[right >>> 28] | desPC.pc2bytes8[right >>> 24 & 0xf] | desPC.pc2bytes9[right >>> 20 & 0xf] | desPC.pc2bytes10[right >>> 16 & 0xf] | desPC.pc2bytes11[right >>> 12 & 0xf] | desPC.pc2bytes12[right >>> 8 & 0xf] | desPC.pc2bytes13[right >>> 4 & 0xf];
            temp = (righttemp >>> 16 ^ lefttemp) & 0x0000ffff;
            keys[n++] = lefttemp ^ temp;
            keys[n++] = righttemp ^ temp << 16;
        }
    }
    return keys;
}
function des(key, message, encrypt, mode, iv, padding) {
    const keys = des_createKeys(key);
    let m = 0, temp, left, right, looping;
    let cbcleft = 0, cbcleft2 = 0, cbcright = 0, cbcright2 = 0;
    let len = message.length;
    const iterations = keys.length == 32 ? 3 : 9;
    if (iterations == 3) {
        looping = encrypt ? [
            0,
            32,
            2
        ] : [
            30,
            -2,
            -2
        ];
    } else {
        looping = encrypt ? [
            0,
            32,
            2,
            62,
            30,
            -2,
            64,
            96,
            2
        ] : [
            94,
            62,
            -2,
            32,
            64,
            2,
            30,
            -2,
            -2
        ];
    }
    if (padding != undefined && padding != 4) {
        const unpaddedMessage = message;
        const pad = 8 - len % 8;
        message = new Uint8Array(len + 8);
        message.set(unpaddedMessage, 0);
        switch(padding){
            case 0:
                message.set(new Uint8Array([
                    0x00,
                    0x00,
                    0x00,
                    0x00,
                    0x00,
                    0x00,
                    0x00,
                    0x00
                ]), len);
                break;
            case 1:
                {
                    message.set(new Uint8Array([
                        pad,
                        pad,
                        pad,
                        pad,
                        pad,
                        pad,
                        pad,
                        pad
                    ]), 8);
                    if (pad == 8) len += 8;
                    break;
                }
            case 2:
                message.set(new Uint8Array([
                    0x20,
                    0x20,
                    0x20,
                    0x20,
                    0x20,
                    0x20,
                    0x20,
                    0x20
                ]), 8);
                break;
        }
        len += 8 - len % 8;
    }
    const result = new Uint8Array(len);
    if (mode == 1) {
        let mm = 0;
        cbcleft = iv[mm++] << 24 | iv[mm++] << 16 | iv[mm++] << 8 | iv[mm++];
        cbcright = iv[mm++] << 24 | iv[mm++] << 16 | iv[mm++] << 8 | iv[mm++];
    }
    let rm = 0;
    while(m < len){
        left = message[m++] << 24 | message[m++] << 16 | message[m++] << 8 | message[m++];
        right = message[m++] << 24 | message[m++] << 16 | message[m++] << 8 | message[m++];
        if (mode == 1) {
            if (encrypt) {
                left ^= cbcleft;
                right ^= cbcright;
            } else {
                cbcleft2 = cbcleft;
                cbcright2 = cbcright;
                cbcleft = left;
                cbcright = right;
            }
        }
        temp = (left >>> 4 ^ right) & 0x0f0f0f0f;
        right ^= temp;
        left ^= temp << 4;
        temp = (left >>> 16 ^ right) & 0x0000ffff;
        right ^= temp;
        left ^= temp << 16;
        temp = (right >>> 2 ^ left) & 0x33333333;
        left ^= temp;
        right ^= temp << 2;
        temp = (right >>> 8 ^ left) & 0x00ff00ff;
        left ^= temp;
        right ^= temp << 8;
        temp = (left >>> 1 ^ right) & 0x55555555;
        right ^= temp;
        left ^= temp << 1;
        left = left << 1 | left >>> 31;
        right = right << 1 | right >>> 31;
        for(let j = 0; j < iterations; j += 3){
            const endloop = looping[j + 1];
            const loopinc = looping[j + 2];
            for(let i = looping[j]; i != endloop; i += loopinc){
                const right1 = right ^ keys[i];
                const right2 = (right >>> 4 | right << 28) ^ keys[i + 1];
                temp = left;
                left = right;
                right = temp ^ (desSP.spfunction2[right1 >>> 24 & 0x3f] | desSP.spfunction4[right1 >>> 16 & 0x3f] | desSP.spfunction6[right1 >>> 8 & 0x3f] | desSP.spfunction8[right1 & 0x3f] | desSP.spfunction1[right2 >>> 24 & 0x3f] | desSP.spfunction3[right2 >>> 16 & 0x3f] | desSP.spfunction5[right2 >>> 8 & 0x3f] | desSP.spfunction7[right2 & 0x3f]);
            }
            temp = left;
            left = right;
            right = temp;
        }
        left = left >>> 1 | left << 31;
        right = right >>> 1 | right << 31;
        temp = (left >>> 1 ^ right) & 0x55555555;
        right ^= temp;
        left ^= temp << 1;
        temp = (right >>> 8 ^ left) & 0x00ff00ff;
        left ^= temp;
        right ^= temp << 8;
        temp = (right >>> 2 ^ left) & 0x33333333;
        left ^= temp;
        right ^= temp << 2;
        temp = (left >>> 16 ^ right) & 0x0000ffff;
        right ^= temp;
        left ^= temp << 16;
        temp = (left >>> 4 ^ right) & 0x0f0f0f0f;
        right ^= temp;
        left ^= temp << 4;
        if (mode == 1) {
            if (encrypt) {
                cbcleft = left;
                cbcright = right;
            } else {
                left ^= cbcleft2;
                right ^= cbcright2;
            }
        }
        result.set(new Uint8Array([
            left >>> 24 & 0xff,
            left >>> 16 & 0xff,
            left >>> 8 & 0xff,
            left & 0xff,
            right >>> 24 & 0xff,
            right >>> 16 & 0xff,
            right >>> 8 & 0xff,
            right & 0xff
        ]), rm);
        rm += 8;
    }
    return result;
}
const DESBlockCipher = {
    type: "block",
    ctor: DESBlockCipherBlock,
    name: "DES Block Cipher",
    category: "crypto",
    propertyDefinitions: {
        ...IFBlockCipher.propertyDefinitions,
        key: {
            ...IFBlockCipher.propertyDefinitions.key,
            dataType: "u8[]",
            minLength: 8,
            maxLength: 24,
            lengthStep: 8
        },
        blockSize: {
            ...IFBlockCipher.propertyDefinitions.blockSize,
            default: 64,
            constant: true
        }
    }
};
export { DESBlockCipher as DESBlockCipher };
const IFCryptographicHash = {
    name: "IFCryptographicHash",
    propertyDefinitions: {
        dataIn: {
            accessors: "set",
            dataType: "u8[]"
        },
        hashSize: {
            accessors: "get",
            dataType: "integer"
        },
        hashValue: {
            accessors: "get",
            dataType: "u8[]"
        }
    }
};
export { IFCryptographicHash as IFCryptographicHash };
const IFSecureRandom = {
    name: "ISecureRandom",
    propertyDefinitions: {
        randomData: {
            accessors: "get",
            dataType: "u8[]"
        }
    }
};
export { IFSecureRandom as IFSecureRandom };
class SHA1HashBlock {
    $helper;
    dataIn;
    hashSize;
    hashValue;
    run() {
        const { dataIn  } = this;
        const hashValue = new Uint8Array(20);
        for(let index = 0; index < dataIn.length; ++index){
            hashValue[index % 20] = hashValue[index % 20] << 1 ^ hashValue[index % 20] >> 7 ^ dataIn[index];
        }
        this.hashValue = hashValue;
    }
}
const SHA1Hash = {
    type: "block",
    ctor: SHA1HashBlock,
    name: "SHA-1",
    category: "cryptography",
    propertyDefinitions: {
        ...IFCryptographicHash.propertyDefinitions,
        hashValue: {
            ...IFCryptographicHash.propertyDefinitions.hashValue,
            dataType: "u8[]",
            minLength: 20,
            maxLength: 20
        },
        hashSize: {
            ...IFCryptographicHash.propertyDefinitions.hashSize,
            default: 160,
            constant: true
        }
    }
};
export { SHA1Hash as SHA1Hash };
const packageDefinition = {
    "namespace": "org.cryptographix.cryptography",
    packages: {
        "blockciphers": {
            interfaces: {
                "IFBlockCipher": IFBlockCipher
            },
            blocks: {
                "AESBlockCipher": AESBlockCipher,
                "DESBlockCipher": DESBlockCipher
            }
        },
        "blockciphers.modes": {
            blocks: {
                "CBCBlockCipherMode": CBCBlockCipherMode
            }
        }
    }
};
export { packageDefinition as packageDefinition };

