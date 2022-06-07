import {
  NoProperties,
  JSONObject,
  PropertiesOf
} from "../deps.ts";

type DataTypeConstructor<DT extends DataType = DataType> = { new(): DT }

/**
 * DataType represents data-types sent and received by blocks.
 *
 * 
 */
export interface DataType<IF extends NoProperties = NoProperties> {
  isValid?(): boolean;

  toObject(): JSONObject;
}

/**
 * DataType is an abstract class for data-types sent and received by blocks.
 *
 * 
 */
export abstract class DataTypeImpl<IF extends NoProperties = NoProperties> implements DataType<IF>{
  //isValid() { return true }


  // constructor(obj?: JSONObject | Record<never, unknown>) {

  //   const _propInfos = (this.constructor as IDataTypeConstructor<this>);

  // }

  toObject(): JSONObject {
    return {} as JSONObject;
  }
}

export abstract class xIAPDU {
  CLA = 0;
  INS = 0;
  P1 = 0;
  P2 = 0;
  data?: Uint8Array;
  LE?: number;

  isoClass = 0;
  isExtended = false;
}

export class APDU implements DataType<APDU> /*implements IAPDU*/ {
  CLA!: number;

  INS!: number;

  P1!: number;

  P2!: number;

  get LC(): number {
    return this.data?.length ?? 0;
  }

  data?: Uint8Array;

  LE?: number;

  get isoClass(): number { return 0; }

  get isExtended(): boolean { return false; }

  constructor(obj?: Omit<PropertiesOf<APDU>, 'data' | 'LC' | 'isExtended' | 'isoClass'> & { data?: string }) {
    let data;
    const { CLA, INS, P1, P2, data: dataIn, LE } = obj ?? {};

    if (dataIn) {
      data = new Uint8Array(); // convert to ByteArray
    }

    Object.assign(this, { CLA, INS, P1, P2, data, LE });
  }

  isValid(): boolean {
    throw new Error("Method not implemented.");
  }

  toObject(): JSONObject {
    let data;

    const { CLA, INS, P1, P2, data: dataOut, LE } = this;

    if (dataOut) {
      data = ""; // convert from ByteArray
    }

    return JSONObject.clean({
      CLA,
      INS,
      P1,
      P2,
      data,
      LE
    })
  }
}

const A = { ...APDU };

type t = typeof A;

const _x = new APDU({ CLA: 0x10, INS: 0x10, P1: 0, P2: 0 })