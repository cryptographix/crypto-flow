import {
  Block,
  BlockDefinition} from "../deps.ts";
import { IFBlockCipher } from "../interfaces/block-cipher.ts";

type IN = Pick<IFBlockCipher, "plainText" | "key" | "direction">;
type OUT = Pick<IFBlockCipher, "cipherText" | "blockSize">;

class DESBlockCipherBlock implements Block<DESBlockCipherBlock>, IFBlockCipher {
  direction: "encrypt" | "decrypt" = "encrypt";

  key!: Uint8Array;

  blockSize!: number; //  = 64;

  plainText!: Uint8Array;

  cipherText!: Uint8Array;

  run(): void {
    const { key, plainText, direction } = this;

    if (direction === "encrypt") {
      this.cipherText = des(key,
        plainText,
        1, // encrypt
        0,//ECB
        undefined,
        4 // nopad
      );
    }
    else {
      this.cipherText = des(key,
        plainText,
        0, // decrypt
        0,//ECB
        undefined,
        4 // nopad
      );
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


//this takes as input a 64 bit key (even though only 56 bits are used)
//as an array of 2 integers, and returns 16 48 bit keys
function des_createKeys(key: Uint8Array) {
  //how many iterations (1 for des, 3 for triple des)
  const iterations = key.length > 8 ? 3 : 1; //changed by Paul 16/6/2007 to use Triple DES for 9+ byte keys
  //stores the return keys
  const keys = new Uint32Array(32 * iterations);
  //now define the left shifts which need to be done
  const shifts = [0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0];
  //other variables
  let lefttemp,
    righttemp,
    m = 0,
    n = 0;

  for (let j = 0; j < iterations; j++) {
    //either 1 or 3 iterations
    let left = (key[m++] << 24) | (key[m++] << 16) | (key[m++] << 8) | key[m++];
    let right =
      (key[m++] << 24) | (key[m++] << 16) | (key[m++] << 8) | key[m++];

    let temp = ((left >>> 4) ^ right) & 0x0f0f0f0f;
    right ^= temp;
    left ^= temp << 4;
    temp = ((right >>> -16) ^ left) & 0x0000ffff;
    left ^= temp;
    right ^= temp << -16;
    temp = ((left >>> 2) ^ right) & 0x33333333;
    right ^= temp;
    left ^= temp << 2;
    temp = ((right >>> -16) ^ left) & 0x0000ffff;
    left ^= temp;
    right ^= temp << -16;
    temp = ((left >>> 1) ^ right) & 0x55555555;
    right ^= temp;
    left ^= temp << 1;
    temp = ((right >>> 8) ^ left) & 0x00ff00ff;
    left ^= temp;
    right ^= temp << 8;
    temp = ((left >>> 1) ^ right) & 0x55555555;
    right ^= temp;
    left ^= temp << 1;

    //the right side needs to be shifted and to get the last four bits of the left side
    temp = (left << 8) | ((right >>> 20) & 0x000000f0);
    //left needs to be put upside down
    left =
      (right << 24) |
      ((right << 8) & 0xff0000) |
      ((right >>> 8) & 0xff00) |
      ((right >>> 24) & 0xf0);
    right = temp;

    //now go through and perform these shifts on the left and right keys
    for (let i = 0; i < shifts.length; i++) {
      //shift the keys either one or two bits to the left
      if (shifts[i]) {
        left = (left << 2) | (left >>> 26);
        right = (right << 2) | (right >>> 26);
      } else {
        left = (left << 1) | (left >>> 27);
        right = (right << 1) | (right >>> 27);
      }
      left &= -0xf;
      right &= -0xf;

      //now apply PC-2, in such a way that E is easier when encrypting or decrypting
      //this conversion will look like PC-2 except only the last 6 bits of each byte are used
      //rather than 48 consecutive bits and the order of lines will be according to
      //how the S selection functions will be applied: S2, S4, S6, S8, S1, S3, S5, S7
      lefttemp =
        desPC.pc2bytes0[left >>> 28] |
        desPC.pc2bytes1[(left >>> 24) & 0xf] |
        desPC.pc2bytes2[(left >>> 20) & 0xf] |
        desPC.pc2bytes3[(left >>> 16) & 0xf] |
        desPC.pc2bytes4[(left >>> 12) & 0xf] |
        desPC.pc2bytes5[(left >>> 8) & 0xf] |
        desPC.pc2bytes6[(left >>> 4) & 0xf];
      righttemp =
        desPC.pc2bytes7[right >>> 28] |
        desPC.pc2bytes8[(right >>> 24) & 0xf] |
        desPC.pc2bytes9[(right >>> 20) & 0xf] |
        desPC.pc2bytes10[(right >>> 16) & 0xf] |
        desPC.pc2bytes11[(right >>> 12) & 0xf] |
        desPC.pc2bytes12[(right >>> 8) & 0xf] |
        desPC.pc2bytes13[(right >>> 4) & 0xf];
      temp = ((righttemp >>> 16) ^ lefttemp) & 0x0000ffff;
      keys[n++] = lefttemp ^ temp;
      keys[n++] = righttemp ^ (temp << 16);
    }
  } //for each iterations

  return keys;
}

function des(
  key: Uint8Array,
  message: Uint8Array,
  encrypt: 0 | 1,
  mode: 0,
  iv: undefined,
  padding?: 0 | 1 | 2 | 4
): Uint8Array;
function des(
  key: Uint8Array,
  message: Uint8Array,
  encrypt: 0 | 1,
  mode: 1,
  iv: Uint8Array,
  padding?: 0 | 1 | 2 | 4
): Uint8Array;
function des(
  key: Uint8Array,
  message: Uint8Array,
  encrypt: 0 | 1,
  mode: 0 | 1,
  iv?: Uint8Array,
  padding?: 0 | 1 | 2 | 4
): Uint8Array {

  //create the 16 or 48 subkeys we will need
  const keys = des_createKeys(key);

  let m = 0,
    temp: number,
    left: number,
    right: number,
    looping;
  let cbcleft = 0, cbcleft2 = 0, cbcright = 0, cbcright2 = 0;
  let len = message.length;

  //set up the loops for single and triple des
  const iterations = keys.length == 32 ? 3 : 9; //single or triple des

  if (iterations == 3) {
    looping = encrypt ? [0, 32, 2] : [30, -2, -2];
  } else {
    looping = encrypt
      ? [0, 32, 2, 62, 30, -2, 64, 96, 2]
      : [94, 62, -2, 32, 64, 2, 30, -2, -2];
  }

  // pad the message depending on the padding parameter
  if (padding != undefined && padding != 4) {
    const unpaddedMessage = message;
    const pad = 8 - (len % 8);

    message = new Uint8Array(len + 8);
    message.set(unpaddedMessage, 0);

    switch (padding) {
      case 0: // zero-pad
        message.set(
          new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
          len
        );
        break;

      case 1: {
        // PKCS7 padding
        message.set(
          new Uint8Array([pad, pad, pad, pad, pad, pad, pad, pad]),
          8
        );

        if (pad == 8) len += 8;

        break;
      }

      case 2: // pad the message with spaces
        message.set(
          new Uint8Array([0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20]),
          8
        );
        break;
    }

    len += 8 - (len % 8);
  }

  // store the result here
  const result = new Uint8Array(len);

  if (mode == 1) {
    //CBC mode
    let mm = 0;

    cbcleft =
      (iv![mm++] << 24) | (iv![mm++] << 16) | (iv![mm++] << 8) | iv![mm++];
    cbcright =
      (iv![mm++] << 24) | (iv![mm++] << 16) | (iv![mm++] << 8) | iv![mm++];
  }

  let rm = 0;

  //loop through each 64 bit chunk of the message
  while (m < len) {
    left =
      (message[m++] << 24) |
      (message[m++] << 16) |
      (message[m++] << 8) |
      message[m++];
    right =
      (message[m++] << 24) |
      (message[m++] << 16) |
      (message[m++] << 8) |
      message[m++];

    //for Cipher Block Chaining mode, xor the message with the previous result
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

    //first each 64 but chunk of the message must be permuted according to IP
    temp = ((left >>> 4) ^ right) & 0x0f0f0f0f;
    right ^= temp;
    left ^= temp << 4;
    temp = ((left >>> 16) ^ right) & 0x0000ffff;
    right ^= temp;
    left ^= temp << 16;
    temp = ((right >>> 2) ^ left) & 0x33333333;
    left ^= temp;
    right ^= temp << 2;
    temp = ((right >>> 8) ^ left) & 0x00ff00ff;
    left ^= temp;
    right ^= temp << 8;
    temp = ((left >>> 1) ^ right) & 0x55555555;
    right ^= temp;
    left ^= temp << 1;

    left = (left << 1) | (left >>> 31);
    right = (right << 1) | (right >>> 31);

    //do this either 1 or 3 times for each chunk of the message
    for (let j = 0; j < iterations; j += 3) {
      const endloop = looping[j + 1];
      const loopinc = looping[j + 2];

      //now go through and perform the encryption or decryption
      for (let i = looping[j]; i != endloop; i += loopinc) {
        //for efficiency
        const right1 = right ^ keys[i];
        const right2 = ((right >>> 4) | (right << 28)) ^ keys[i + 1];

        //the result is attained by passing these bytes through the S selection functions
        temp = left;
        left = right;
        right =
          temp ^
          (desSP.spfunction2[(right1 >>> 24) & 0x3f] |
            desSP.spfunction4[(right1 >>> 16) & 0x3f] |
            desSP.spfunction6[(right1 >>> 8) & 0x3f] |
            desSP.spfunction8[right1 & 0x3f] |
            desSP.spfunction1[(right2 >>> 24) & 0x3f] |
            desSP.spfunction3[(right2 >>> 16) & 0x3f] |
            desSP.spfunction5[(right2 >>> 8) & 0x3f] |
            desSP.spfunction7[right2 & 0x3f]);
      }

      temp = left;
      left = right;
      right = temp; //unreverse left and right
    } //for either 1 or 3 iterations

    //move then each one bit to the right
    left = (left >>> 1) | (left << 31);
    right = (right >>> 1) | (right << 31);

    //now perform IP-1, which is IP in the opposite direction
    temp = ((left >>> 1) ^ right) & 0x55555555;
    right ^= temp;
    left ^= temp << 1;
    temp = ((right >>> 8) ^ left) & 0x00ff00ff;
    left ^= temp;
    right ^= temp << 8;
    temp = ((right >>> 2) ^ left) & 0x33333333;
    left ^= temp;
    right ^= temp << 2;
    temp = ((left >>> 16) ^ right) & 0x0000ffff;
    right ^= temp;
    left ^= temp << 16;
    temp = ((left >>> 4) ^ right) & 0x0f0f0f0f;
    right ^= temp;
    left ^= temp << 4;

    //for Cipher Block Chaining mode, xor the message with the previous result
    if (mode == 1) {
      if (encrypt) {
        cbcleft = left;
        cbcright = right;
      } else {
        left ^= cbcleft2;
        right ^= cbcright2;
      }
    }

    result.set(
      new Uint8Array([
        (left >>> 24) & 0xff,
        (left >>> 16) & 0xff,
        (left >>> 8) & 0xff,
        left & 0xff,
        (right >>> 24) & 0xff,
        (right >>> 16) & 0xff,
        (right >>> 8) & 0xff,
        right & 0xff
      ]),
      rm
    );

    rm += 8;
  } //for every 8 characters, or 64 bits in the message

  return result;
} //end of des

export const DESBlockCipher: BlockDefinition<DESBlockCipherBlock> = {
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
      lengthStep: 8,
    },
    blockSize: {
      ...IFBlockCipher.propertyDefinitions.blockSize,
      default: 64,
      constant: true,
    },
  },
};
