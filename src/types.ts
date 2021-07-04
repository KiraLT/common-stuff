/**
 * Primitive types union.
 *
 * In JavaScript, a primitive (primitive value, primitive data type) is data
 * that is not an object and has no methods. There are 7 primitive data types:
 * string, number, bigint, boolean, undefined, symbol, and null.
 */
export type Primitive =
    | undefined
    | null
    | string
    | number
    | bigint
    | boolean
    | symbol
