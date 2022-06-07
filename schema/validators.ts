import {
  IPropertyInfo,

} from "./property.ts";
import { ByteArray } from "./type-helpers.ts";

export class PropertyValidationError extends Error {}

/*export function validateDefaultProp(
  _value: boolean,
  _prop: IPropertyInfo
): void {}

export function validateIntegerProp(
  value: number,
  prop: IPropertyInfo
): void {
  if (!Number.isInteger(value)) {
    throw new PropertyValidationError(`Value must be an integer`);
  }

  if (prop.minValue != null && value < prop.minValue) {
    throw new PropertyValidationError(
      `Value must be at least ${prop.minValue}`
    );
  }

  if (prop.maxValue != null && value > prop.maxValue) {
    throw new PropertyValidationError(`Value must be at most ${prop.maxValue}`);
  }
}

export function validateStringProp(
  value: string,
  prop: IPropertyInfo
): void {
  const len = value.length;

  if (
    prop.minLength != null &&
    prop.minLength == prop.maxLength &&
    len != prop.minLength
  ) {
    throw new PropertyValidationError(
      `String length must be ${prop.minLength} but string has ${len} characters`
    );
  }

  if (prop.minLength != null && len < prop.minLength) {
    throw new PropertyValidationError(
      `Minimum string length is ${
        prop.minLength
      } but string has ${len} characters`
    );
  }

  if (prop.maxLength != null && len > prop.maxLength) {
    throw new PropertyValidationError(
      `Maximum string length is ${
        prop.maxLength
      } but string has ${len} characters`
    );
  }
}

export function validateEnumProp(value: string, prop: IEnumSchemaProp): void {
  // deno-lint-ignore no-prototype-builtins
  if (!prop.options.hasOwnProperty(value)) {
    throw new PropertyValidationError(`Value must be in list`);
  }
}

export function validateBytesProp(
  value: ByteArray,
  prop: IPropertyInfo
): void {
  const len = value.length;

  if (
    prop.minLength != null &&
    prop.minLength == prop.maxLength &&
    len != prop.minLength
  ) {
    throw new PropertyValidationError(
      `Length must be ${prop.minLength} bytes but is ${len}`
    );
  }
  if (prop.minLength != null && len < prop.minLength)
    throw new PropertyValidationError(
      `Minimum length is ${prop.minLength} bytes but is ${len}`
    );

  if (prop.maxLength != null && len > prop.maxLength)
    throw new PropertyValidationError(
      `Maximum length is ${prop.maxLength} bytes but string is ${len}`
    );
}
*/