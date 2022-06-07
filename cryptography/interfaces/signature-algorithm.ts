// export interface ISignatureAlgorithm {
//   dataToSign: Uint8Array;

//   signKey: Uint8Array;

//   signature: Uint8Array;

//   signatureSize: number;
// }

// const signatureProps: InterfacePropertyInfos<ISignatureAlgorithm> = {
//   signKey: { accessors: "set", dataType: "u8[]" },
//   dataToSign: { accessors: "set", dataType: "u8[]" },

//   signatureSize: { accessors: "get", dataType: "integer" },
//   signature: { accessors: "get", dataType: "u8[]" },
// };

// export const ISignatureAlgorithm = registerInterface<ISignatureAlgorithm>(
//   "ISignatureAlgorithm",
//   "org.cryptographix.cryptography",
//   signatureProps
// );

// export interface ISignatureVerificationAlgorithm {
//   dataToVerify: Uint8Array;

//   verifyKey: Uint8Array;

//   signature: Uint8Array;

//   signatureSize: number;
// }

// const verifyProps: InterfacePropertyInfos<ISignatureVerificationAlgorithm> = {
//   verifyKey: { accessors: "set", dataType: "u8[]" },
//   dataToVerify: { accessors: "set", dataType: "u8[]" },

//   signatureSize: { accessors: "get", dataType: "integer" },
//   signature: { accessors: "get", dataType: "u8[]" },
// };

// export const ISignatureVerificationAlgorithm =
//   registerInterface<ISignatureVerificationAlgorithm>(
//     "ISignatureVerificationAlgorithm",
//     "org.cryptographix.cryptography",
//     verifyProps
//   );
