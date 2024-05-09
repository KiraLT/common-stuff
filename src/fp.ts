import { ensureError } from '.'

class Placeholder {
    __PLACEHOLDER__ = '__PLACEHOLDER__'

    constructor() {
        // Fix instanceof bug: https://github.com/microsoft/TypeScript/issues/22585
        Object.setPrototypeOf(this, Placeholder.prototype)
    }
}

/**
 * A special placeholder value used to specify "gaps" within curried functions,
 * allowing partial application of any combination of arguments, regardless of their positions.
 *
 * @group FP
 */
export const __ = new Placeholder()
type T__ = typeof __

/**
 * Perform left-to-right function composition.
 *
 * @example
 * ```
 * pipe(
 *     [1, 2, 3, 4],
 *     arr => arr.map(v => v * 2),
 *     arr => arr.map(v => v + 2)
 * )
 * // [4, 6, 8, 10]
 *```
 * @group FP
 */
export function pipe<A, B>(value: A, op1: (input: A) => B): B
export function pipe<A, B, C>(
    value: A,
    op1: (input: A) => B,
    op2: (input: B) => C,
): C
export function pipe<A, B, C, D>(
    value: A,
    op1: (input: A) => B,
    op2: (input: B) => C,
    op3: (input: C) => D,
): D
export function pipe<A, B, C, D, E>(
    value: A,
    op1: (input: A) => B,
    op2: (input: B) => C,
    op3: (input: C) => D,
    op4: (input: D) => E,
): E
export function pipe<A, B, C, D, E, F>(
    value: A,
    op1: (input: A) => B,
    op2: (input: B) => C,
    op3: (input: C) => D,
    op4: (input: D) => E,
    op5: (input: E) => F,
): F
export function pipe<A, B, C, D, E, F, G>(
    value: A,
    op1: (input: A) => B,
    op2: (input: B) => C,
    op3: (input: C) => D,
    op4: (input: D) => E,
    op5: (input: E) => F,
    op6: (input: F) => G,
): G
export function pipe<A, B, C, D, E, F, G, H>(
    value: A,
    op1: (input: A) => B,
    op2: (input: B) => C,
    op3: (input: C) => D,
    op4: (input: D) => E,
    op5: (input: E) => F,
    op6: (input: F) => G,
    op7: (input: G) => H,
): H
export function pipe(
    value: unknown,
    ...operations: Array<(value: unknown) => unknown>
): unknown
export function pipe(
    value: unknown,
    ...operations: Array<(value: unknown) => unknown>
): unknown {
    return operations.reduce((prev, cur) => cur(prev), value)
}

/**
 * Perform right-to-left function composition.
 *
 * @example
 * ```
 * const func = compose(
 *     arr => arr.map(v => v + 2)
 *     (arr: number[]) => arr.map(v => v * 2),
 * )
 * // [4, 6, 8, 10]
 * //
 * ```
 * @group FP
 */
export function compose<T1, T2>(op1: (input: T1) => T2): (input: T1) => T2
export function compose<T1, T2, T3>(
    op2: (input: T2) => T3,
    op1: (input: T1) => T2,
): (input: T1) => T3
export function compose<T1, T2, T3, T4>(
    op3: (input: T3) => T4,
    op2: (input: T2) => T3,
    op1: (input: T1) => T2,
): (input: T1) => T4
export function compose<T1, T2, T3, T4, T5>(
    op4: (input: T4) => T5,
    op3: (input: T3) => T4,
    op2: (input: T2) => T3,
    op1: (input: T1) => T2,
): (input: T1) => T5
export function compose<T1, T2, T3, T4, T5, T6>(
    op5: (input: T5) => T6,
    op4: (input: T4) => T5,
    op3: (input: T3) => T4,
    op2: (input: T2) => T3,
    op1: (input: T1) => T2,
): (input: T1) => T6
export function compose<T1, T2, T3, T4, T5, T6, T7>(
    op6: (input: T6) => T7,
    op5: (input: T5) => T6,
    op4: (input: T4) => T5,
    op3: (input: T3) => T4,
    op2: (input: T2) => T3,
    op1: (input: T1) => T2,
): (input: T1) => T7
export function compose<T1, T2, T3, T4, T5, T6, T7, T8>(
    op7: (input: T7) => T8,
    op6: (input: T6) => T7,
    op5: (input: T5) => T6,
    op4: (input: T4) => T5,
    op3: (input: T3) => T4,
    op2: (input: T2) => T3,
    op1: (input: T1) => T2,
): (input: T1) => T8
export function compose(
    ...operations: Array<(value: unknown) => unknown>
): (value: unknown) => unknown
export function compose(
    ...operations: Array<(value: unknown) => unknown>
): (value: unknown) => unknown {
    return (value) => pipe(value, ...[...operations].reverse())
}

type Curry1<T1, R> = {
    (): Curry1<T1, R>
    (t1: T1): R
}
type Curry2<T1, T2, R> = {
    (): Curry2<T1, T2, R>
    (t1: T1): Curry1<T2, R>
    (t1: T1, t2: T2): R
    (t1: T__, t2: T2): Curry1<T1, R>
    (t1: T1, t2: T__): Curry1<T2, R>
}
type Curry3<T1, T2, T3, R> = {
    (): Curry3<T1, T2, T3, R>
    (t1: T1): Curry2<T2, T3, R>
    (t1: T1, t2: T2): Curry1<T3, R>
    (t1: T__, t2: T2): Curry2<T1, T3, R>
    (t1: T1, t2: T__): Curry2<T2, T3, R>
    (t1: T1, t2: T2, t3: T3): R
    (t1: T__, t2: T2, t3: T3): Curry1<T1, R>
    (t1: T1, t2: T__, t3: T3): Curry1<T2, R>
    (t1: T1, t2: T2, t3: T__): Curry1<T3, R>
    (t1: T__, t2: T__, t3: T3): Curry2<T1, T2, R>
    (t1: T__, t2: T2, t3: T__): Curry2<T1, T3, R>
    (t1: T1, t2: T__, t3: T__): Curry2<T2, T3, R>
}
type Curry4<T1, T2, T3, T4, R> = {
    (): Curry4<T1, T2, T3, T4, R>
    (t1: T1): Curry3<T2, T3, T4, R>
    (t1: T1, t2: T2): Curry2<T3, T4, R>
    (t1: T__, t2: T2): Curry3<T1, T3, T4, R>
    (t1: T1, t2: T__): Curry3<T2, T3, T4, R>
    (t1: T1, t2: T2, t3: T3): Curry1<T4, R>
    (t1: T__, t2: T2, t3: T3): Curry2<T1, T4, R>
    (t1: T1, t2: T__, t3: T3): Curry2<T2, T4, R>
    (t1: T1, t2: T2, t3: T__): Curry2<T3, T4, R>
    (t1: T__, t2: T__, t3: T3): Curry3<T1, T2, T4, R>
    (t1: T__, t2: T2, t3: T__): Curry3<T1, T3, T4, R>
    (t1: T1, t2: T__, t3: T__): Curry3<T2, T3, T4, R>
    (t1: T1, t2: T2, t3: T3, t4: T4): R
    (t1: T__, t2: T2, t3: T3, t4: T4): Curry1<T1, R>
    (t1: T1, t2: T__, t3: T3, t4: T4): Curry1<T2, R>
    (t1: T1, t2: T2, t3: T__, t4: T4): Curry1<T3, R>
    (t1: T1, t2: T2, t3: T3, t4: T__): Curry1<T4, R>
    (t1: T__, t2: T__, t3: T3, t4: T4): Curry2<T1, T2, R>
    (t1: T__, t2: T2, t3: T__, t4: T4): Curry2<T1, T3, R>
    (t1: T__, t2: T2, t3: T3, t4: T__): Curry2<T1, T4, R>
    (t1: T1, t2: T__, t3: T__, t4: T4): Curry2<T2, T3, R>
    (t1: T1, t2: T__, t3: T3, t4: T__): Curry2<T2, T4, R>
    (t1: T1, t2: T2, t3: T__, t4: T__): Curry2<T3, T4, R>
    (t1: T__, t2: T__, t3: T__, t4: T4): Curry3<T1, T2, T3, R>
    (t1: T__, t2: T__, t3: T3, t4: T__): Curry3<T1, T2, T4, R>
    (t1: T__, t2: T2, t3: T__, t4: T__): Curry3<T1, T3, T4, R>
    (t1: T1, t2: T__, t3: T__, t4: T__): Curry3<T2, T3, T4, R>
}
type Curry5<T1, T2, T3, T4, T5, R> = {
    (): Curry5<T1, T2, T3, T4, T5, R>
    (t1: T1): Curry4<T2, T3, T4, T5, R>
    (t1: T1, t2: T2): Curry3<T3, T4, T5, R>
    (t1: T__, t2: T2): Curry4<T1, T3, T4, T5, R>
    (t1: T1, t2: T__): Curry4<T2, T3, T4, T5, R>
    (t1: T1, t2: T2, t3: T3): Curry2<T4, T5, R>
    (t1: T__, t2: T2, t3: T3): Curry3<T1, T4, T5, R>
    (t1: T1, t2: T__, t3: T3): Curry3<T2, T4, T5, R>
    (t1: T1, t2: T2, t3: T__): Curry3<T3, T4, T5, R>
    (t1: T__, t2: T__, t3: T3): Curry4<T1, T2, T4, T5, R>
    (t1: T__, t2: T2, t3: T__): Curry4<T1, T3, T4, T5, R>
    (t1: T1, t2: T__, t3: T__): Curry4<T2, T3, T4, T5, R>
    (t1: T1, t2: T2, t3: T3, t4: T4): Curry1<T5, R>
    (t1: T__, t2: T2, t3: T3, t4: T4): Curry2<T1, T5, R>
    (t1: T1, t2: T__, t3: T3, t4: T4): Curry2<T2, T5, R>
    (t1: T1, t2: T2, t3: T__, t4: T4): Curry2<T3, T5, R>
    (t1: T1, t2: T2, t3: T3, t4: T__): Curry2<T4, T5, R>
    (t1: T__, t2: T__, t3: T3, t4: T4): Curry3<T1, T2, T5, R>
    (t1: T__, t2: T2, t3: T__, t4: T4): Curry3<T1, T3, T5, R>
    (t1: T__, t2: T2, t3: T3, t4: T__): Curry3<T1, T4, T5, R>
    (t1: T1, t2: T__, t3: T__, t4: T4): Curry3<T2, T3, T5, R>
    (t1: T1, t2: T__, t3: T3, t4: T__): Curry3<T2, T4, T5, R>
    (t1: T1, t2: T2, t3: T__, t4: T__): Curry3<T3, T4, T5, R>
    (t1: T__, t2: T__, t3: T__, t4: T4): Curry4<T1, T2, T3, T5, R>
    (t1: T__, t2: T__, t3: T3, t4: T__): Curry4<T1, T2, T4, T5, R>
    (t1: T__, t2: T2, t3: T__, t4: T__): Curry4<T1, T3, T4, T5, R>
    (t1: T1, t2: T__, t3: T__, t4: T__): Curry4<T2, T3, T4, T5, R>
    (t1: T1, t2: T2, t3: T3, t4: T4, t5: T5): R
    (t1: T__, t2: T2, t3: T3, t4: T4, t5: T5): Curry1<T1, R>
    (t1: T1, t2: T__, t3: T3, t4: T4, t5: T5): Curry1<T2, R>
    (t1: T1, t2: T2, t3: T__, t4: T4, t5: T5): Curry1<T3, R>
    (t1: T1, t2: T2, t3: T3, t4: T__, t5: T5): Curry1<T4, R>
    (t1: T1, t2: T2, t3: T3, t4: T4, t5: T__): Curry1<T5, R>
    (t1: T__, t2: T__, t3: T3, t4: T4, t5: T5): Curry2<T1, T2, R>
    (t1: T__, t2: T2, t3: T__, t4: T4, t5: T5): Curry2<T1, T3, R>
    (t1: T__, t2: T2, t3: T3, t4: T__, t5: T5): Curry2<T1, T4, R>
    (t1: T__, t2: T2, t3: T3, t4: T4, t5: T__): Curry2<T1, T5, R>
    (t1: T1, t2: T__, t3: T__, t4: T4, t5: T5): Curry2<T2, T3, R>
    (t1: T1, t2: T__, t3: T3, t4: T__, t5: T5): Curry2<T2, T4, R>
    (t1: T1, t2: T__, t3: T3, t4: T4, t5: T__): Curry2<T2, T5, R>
    (t1: T1, t2: T2, t3: T__, t4: T__, t5: T5): Curry2<T3, T4, R>
    (t1: T1, t2: T2, t3: T__, t4: T4, t5: T__): Curry2<T3, T5, R>
    (t1: T1, t2: T2, t3: T3, t4: T__, t5: T__): Curry2<T4, T5, R>
    (t1: T__, t2: T__, t3: T__, t4: T4, t5: T5): Curry3<T1, T2, T3, R>
    (t1: T__, t2: T__, t3: T3, t4: T__, t5: T5): Curry3<T1, T2, T4, R>
    (t1: T__, t2: T__, t3: T3, t4: T4, t5: T__): Curry3<T1, T2, T5, R>
    (t1: T__, t2: T2, t3: T__, t4: T__, t5: T5): Curry3<T1, T3, T4, R>
    (t1: T__, t2: T2, t3: T__, t4: T4, t5: T__): Curry3<T1, T3, T5, R>
    (t1: T__, t2: T2, t3: T3, t4: T__, t5: T__): Curry3<T1, T4, T5, R>
    (t1: T1, t2: T__, t3: T__, t4: T__, t5: T5): Curry3<T2, T3, T4, R>
    (t1: T1, t2: T__, t3: T__, t4: T4, t5: T__): Curry3<T2, T3, T5, R>
    (t1: T1, t2: T__, t3: T3, t4: T__, t5: T__): Curry3<T2, T4, T5, R>
    (t1: T1, t2: T2, t3: T__, t4: T__, t5: T__): Curry3<T3, T4, T5, R>
    (t1: T__, t2: T__, t3: T__, t4: T__, t5: T5): Curry4<T1, T2, T3, T4, R>
    (t1: T__, t2: T__, t3: T__, t4: T4, t5: T__): Curry4<T1, T2, T3, T5, R>
    (t1: T__, t2: T__, t3: T3, t4: T__, t5: T__): Curry4<T1, T2, T4, T5, R>
    (t1: T__, t2: T2, t3: T__, t4: T__, t5: T__): Curry4<T1, T3, T4, T5, R>
    (t1: T1, t2: T__, t3: T__, t4: T__, t5: T__): Curry4<T2, T3, T4, T5, R>
}
type Curry6<T1, T2, T3, T4, T5, T6, R> = {
    (): Curry6<T1, T2, T3, T4, T5, T6, R>
    (t1: T1): Curry5<T2, T3, T4, T5, T6, R>
    (t1: T1, t2: T2): Curry4<T3, T4, T5, T6, R>
    (t1: T__, t2: T2): Curry5<T1, T3, T4, T5, T6, R>
    (t1: T1, t2: T__): Curry5<T2, T3, T4, T5, T6, R>
    (t1: T1, t2: T2, t3: T3): Curry3<T4, T5, T6, R>
    (t1: T__, t2: T2, t3: T3): Curry4<T1, T4, T5, T6, R>
    (t1: T1, t2: T__, t3: T3): Curry4<T2, T4, T5, T6, R>
    (t1: T1, t2: T2, t3: T__): Curry4<T3, T4, T5, T6, R>
    (t1: T__, t2: T__, t3: T3): Curry5<T1, T2, T4, T5, T6, R>
    (t1: T__, t2: T2, t3: T__): Curry5<T1, T3, T4, T5, T6, R>
    (t1: T1, t2: T__, t3: T__): Curry5<T2, T3, T4, T5, T6, R>
    (t1: T1, t2: T2, t3: T3, t4: T4): Curry2<T5, T6, R>
    (t1: T__, t2: T2, t3: T3, t4: T4): Curry3<T1, T5, T6, R>
    (t1: T1, t2: T__, t3: T3, t4: T4): Curry3<T2, T5, T6, R>
    (t1: T1, t2: T2, t3: T__, t4: T4): Curry3<T3, T5, T6, R>
    (t1: T1, t2: T2, t3: T3, t4: T__): Curry3<T4, T5, T6, R>
    (t1: T__, t2: T__, t3: T3, t4: T4): Curry4<T1, T2, T5, T6, R>
    (t1: T__, t2: T2, t3: T__, t4: T4): Curry4<T1, T3, T5, T6, R>
    (t1: T__, t2: T2, t3: T3, t4: T__): Curry4<T1, T4, T5, T6, R>
    (t1: T1, t2: T__, t3: T__, t4: T4): Curry4<T2, T3, T5, T6, R>
    (t1: T1, t2: T__, t3: T3, t4: T__): Curry4<T2, T4, T5, T6, R>
    (t1: T1, t2: T2, t3: T__, t4: T__): Curry4<T3, T4, T5, T6, R>
    (t1: T__, t2: T__, t3: T__, t4: T4): Curry5<T1, T2, T3, T5, T6, R>
    (t1: T__, t2: T__, t3: T3, t4: T__): Curry5<T1, T2, T4, T5, T6, R>
    (t1: T__, t2: T2, t3: T__, t4: T__): Curry5<T1, T3, T4, T5, T6, R>
    (t1: T1, t2: T__, t3: T__, t4: T__): Curry5<T2, T3, T4, T5, T6, R>
    (t1: T1, t2: T2, t3: T3, t4: T4, t5: T5): Curry1<T6, R>
    (t1: T__, t2: T2, t3: T3, t4: T4, t5: T5): Curry2<T1, T6, R>
    (t1: T1, t2: T__, t3: T3, t4: T4, t5: T5): Curry2<T2, T6, R>
    (t1: T1, t2: T2, t3: T__, t4: T4, t5: T5): Curry2<T3, T6, R>
    (t1: T1, t2: T2, t3: T3, t4: T__, t5: T5): Curry2<T4, T6, R>
    (t1: T1, t2: T2, t3: T3, t4: T4, t5: T__): Curry2<T5, T6, R>
    (t1: T__, t2: T__, t3: T3, t4: T4, t5: T5): Curry3<T1, T2, T6, R>
    (t1: T__, t2: T2, t3: T__, t4: T4, t5: T5): Curry3<T1, T3, T6, R>
    (t1: T__, t2: T2, t3: T3, t4: T__, t5: T5): Curry3<T1, T4, T6, R>
    (t1: T__, t2: T2, t3: T3, t4: T4, t5: T__): Curry3<T1, T5, T6, R>
    (t1: T1, t2: T__, t3: T__, t4: T4, t5: T5): Curry3<T2, T3, T6, R>
    (t1: T1, t2: T__, t3: T3, t4: T__, t5: T5): Curry3<T2, T4, T6, R>
    (t1: T1, t2: T__, t3: T3, t4: T4, t5: T__): Curry3<T2, T5, T6, R>
    (t1: T1, t2: T2, t3: T__, t4: T__, t5: T5): Curry3<T3, T4, T6, R>
    (t1: T1, t2: T2, t3: T__, t4: T4, t5: T__): Curry3<T3, T5, T6, R>
    (t1: T1, t2: T2, t3: T3, t4: T__, t5: T__): Curry3<T4, T5, T6, R>
    (t1: T__, t2: T__, t3: T__, t4: T4, t5: T5): Curry4<T1, T2, T3, T6, R>
    (t1: T__, t2: T__, t3: T3, t4: T__, t5: T5): Curry4<T1, T2, T4, T6, R>
    (t1: T__, t2: T__, t3: T3, t4: T4, t5: T__): Curry4<T1, T2, T5, T6, R>
    (t1: T__, t2: T2, t3: T__, t4: T__, t5: T5): Curry4<T1, T3, T4, T6, R>
    (t1: T__, t2: T2, t3: T__, t4: T4, t5: T__): Curry4<T1, T3, T5, T6, R>
    (t1: T__, t2: T2, t3: T3, t4: T__, t5: T__): Curry4<T1, T4, T5, T6, R>
    (t1: T1, t2: T__, t3: T__, t4: T__, t5: T5): Curry4<T2, T3, T4, T6, R>
    (t1: T1, t2: T__, t3: T__, t4: T4, t5: T__): Curry4<T2, T3, T5, T6, R>
    (t1: T1, t2: T__, t3: T3, t4: T__, t5: T__): Curry4<T2, T4, T5, T6, R>
    (t1: T1, t2: T2, t3: T__, t4: T__, t5: T__): Curry4<T3, T4, T5, T6, R>
    (t1: T__, t2: T__, t3: T__, t4: T__, t5: T5): Curry5<T1, T2, T3, T4, T6, R>
    (t1: T__, t2: T__, t3: T__, t4: T4, t5: T__): Curry5<T1, T2, T3, T5, T6, R>
    (t1: T__, t2: T__, t3: T3, t4: T__, t5: T__): Curry5<T1, T2, T4, T5, T6, R>
    (t1: T__, t2: T2, t3: T__, t4: T__, t5: T__): Curry5<T1, T3, T4, T5, T6, R>
    (t1: T1, t2: T__, t3: T__, t4: T__, t5: T__): Curry5<T2, T3, T4, T5, T6, R>
    (t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, t6: T6): R
    (t1: T__, t2: T2, t3: T3, t4: T4, t5: T5, t6: T6): Curry1<T1, R>
    (t1: T1, t2: T__, t3: T3, t4: T4, t5: T5, t6: T6): Curry1<T2, R>
    (t1: T1, t2: T2, t3: T__, t4: T4, t5: T5, t6: T6): Curry1<T3, R>
    (t1: T1, t2: T2, t3: T3, t4: T__, t5: T5, t6: T6): Curry1<T4, R>
    (t1: T1, t2: T2, t3: T3, t4: T4, t5: T__, t6: T6): Curry1<T5, R>
    (t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, t6: T__): Curry1<T6, R>
    (t1: T__, t2: T__, t3: T3, t4: T4, t5: T5, t6: T6): Curry2<T1, T2, R>
    (t1: T__, t2: T2, t3: T__, t4: T4, t5: T5, t6: T6): Curry2<T1, T3, R>
    (t1: T__, t2: T2, t3: T3, t4: T__, t5: T5, t6: T6): Curry2<T1, T4, R>
    (t1: T__, t2: T2, t3: T3, t4: T4, t5: T__, t6: T6): Curry2<T1, T5, R>
    (t1: T__, t2: T2, t3: T3, t4: T4, t5: T5, t6: T__): Curry2<T1, T6, R>
    (t1: T1, t2: T__, t3: T__, t4: T4, t5: T5, t6: T6): Curry2<T2, T3, R>
    (t1: T1, t2: T__, t3: T3, t4: T__, t5: T5, t6: T6): Curry2<T2, T4, R>
    (t1: T1, t2: T__, t3: T3, t4: T4, t5: T__, t6: T6): Curry2<T2, T5, R>
    (t1: T1, t2: T__, t3: T3, t4: T4, t5: T5, t6: T__): Curry2<T2, T6, R>
    (t1: T1, t2: T2, t3: T__, t4: T__, t5: T5, t6: T6): Curry2<T3, T4, R>
    (t1: T1, t2: T2, t3: T__, t4: T4, t5: T__, t6: T6): Curry2<T3, T5, R>
    (t1: T1, t2: T2, t3: T__, t4: T4, t5: T5, t6: T__): Curry2<T3, T6, R>
    (t1: T1, t2: T2, t3: T3, t4: T__, t5: T__, t6: T6): Curry2<T4, T5, R>
    (t1: T1, t2: T2, t3: T3, t4: T__, t5: T5, t6: T__): Curry2<T4, T6, R>
    (t1: T1, t2: T2, t3: T3, t4: T4, t5: T__, t6: T__): Curry2<T5, T6, R>
    (t1: T__, t2: T__, t3: T__, t4: T4, t5: T5, t6: T6): Curry3<T1, T2, T3, R>
    (t1: T__, t2: T__, t3: T3, t4: T__, t5: T5, t6: T6): Curry3<T1, T2, T4, R>
    (t1: T__, t2: T__, t3: T3, t4: T4, t5: T__, t6: T6): Curry3<T1, T2, T5, R>
    (t1: T__, t2: T__, t3: T3, t4: T4, t5: T5, t6: T__): Curry3<T1, T2, T6, R>
    (t1: T__, t2: T2, t3: T__, t4: T__, t5: T5, t6: T6): Curry3<T1, T3, T4, R>
    (t1: T__, t2: T2, t3: T__, t4: T4, t5: T__, t6: T6): Curry3<T1, T3, T5, R>
    (t1: T__, t2: T2, t3: T__, t4: T4, t5: T5, t6: T__): Curry3<T1, T3, T6, R>
    (t1: T__, t2: T2, t3: T3, t4: T__, t5: T__, t6: T6): Curry3<T1, T4, T5, R>
    (t1: T__, t2: T2, t3: T3, t4: T__, t5: T5, t6: T__): Curry3<T1, T4, T6, R>
    (t1: T__, t2: T2, t3: T3, t4: T4, t5: T__, t6: T__): Curry3<T1, T5, T6, R>
    (t1: T1, t2: T__, t3: T__, t4: T__, t5: T5, t6: T6): Curry3<T2, T3, T4, R>
    (t1: T1, t2: T__, t3: T__, t4: T4, t5: T__, t6: T6): Curry3<T2, T3, T5, R>
    (t1: T1, t2: T__, t3: T__, t4: T4, t5: T5, t6: T__): Curry3<T2, T3, T6, R>
    (t1: T1, t2: T__, t3: T3, t4: T__, t5: T__, t6: T6): Curry3<T2, T4, T5, R>
    (t1: T1, t2: T__, t3: T3, t4: T__, t5: T5, t6: T__): Curry3<T2, T4, T6, R>
    (t1: T1, t2: T__, t3: T3, t4: T4, t5: T__, t6: T__): Curry3<T2, T5, T6, R>
    (t1: T1, t2: T2, t3: T__, t4: T__, t5: T__, t6: T6): Curry3<T3, T4, T5, R>
    (t1: T1, t2: T2, t3: T__, t4: T__, t5: T5, t6: T__): Curry3<T3, T4, T6, R>
    (t1: T1, t2: T2, t3: T__, t4: T4, t5: T__, t6: T__): Curry3<T3, T5, T6, R>
    (t1: T1, t2: T2, t3: T3, t4: T__, t5: T__, t6: T__): Curry3<T4, T5, T6, R>
    (
        t1: T__,
        t2: T__,
        t3: T__,
        t4: T__,
        t5: T5,
        t6: T6,
    ): Curry4<T1, T2, T3, T4, R>
    (
        t1: T__,
        t2: T__,
        t3: T__,
        t4: T4,
        t5: T__,
        t6: T6,
    ): Curry4<T1, T2, T3, T5, R>
    (
        t1: T__,
        t2: T__,
        t3: T__,
        t4: T4,
        t5: T5,
        t6: T__,
    ): Curry4<T1, T2, T3, T6, R>
    (
        t1: T__,
        t2: T__,
        t3: T3,
        t4: T__,
        t5: T__,
        t6: T6,
    ): Curry4<T1, T2, T4, T5, R>
    (
        t1: T__,
        t2: T__,
        t3: T3,
        t4: T__,
        t5: T5,
        t6: T__,
    ): Curry4<T1, T2, T4, T6, R>
    (
        t1: T__,
        t2: T__,
        t3: T3,
        t4: T4,
        t5: T__,
        t6: T__,
    ): Curry4<T1, T2, T5, T6, R>
    (
        t1: T__,
        t2: T2,
        t3: T__,
        t4: T__,
        t5: T__,
        t6: T6,
    ): Curry4<T1, T3, T4, T5, R>
    (
        t1: T__,
        t2: T2,
        t3: T__,
        t4: T__,
        t5: T5,
        t6: T__,
    ): Curry4<T1, T3, T4, T6, R>
    (
        t1: T__,
        t2: T2,
        t3: T__,
        t4: T4,
        t5: T__,
        t6: T__,
    ): Curry4<T1, T3, T5, T6, R>
    (
        t1: T__,
        t2: T2,
        t3: T3,
        t4: T__,
        t5: T__,
        t6: T__,
    ): Curry4<T1, T4, T5, T6, R>
    (
        t1: T1,
        t2: T__,
        t3: T__,
        t4: T__,
        t5: T__,
        t6: T6,
    ): Curry4<T2, T3, T4, T5, R>
    (
        t1: T1,
        t2: T__,
        t3: T__,
        t4: T__,
        t5: T5,
        t6: T__,
    ): Curry4<T2, T3, T4, T6, R>
    (
        t1: T1,
        t2: T__,
        t3: T__,
        t4: T4,
        t5: T__,
        t6: T__,
    ): Curry4<T2, T3, T5, T6, R>
    (
        t1: T1,
        t2: T__,
        t3: T3,
        t4: T__,
        t5: T__,
        t6: T__,
    ): Curry4<T2, T4, T5, T6, R>
    (
        t1: T1,
        t2: T2,
        t3: T__,
        t4: T__,
        t5: T__,
        t6: T__,
    ): Curry4<T3, T4, T5, T6, R>
    (
        t1: T__,
        t2: T__,
        t3: T__,
        t4: T__,
        t5: T__,
        t6: T6,
    ): Curry5<T1, T2, T3, T4, T5, R>
    (
        t1: T__,
        t2: T__,
        t3: T__,
        t4: T__,
        t5: T5,
        t6: T__,
    ): Curry5<T1, T2, T3, T4, T6, R>
    (
        t1: T__,
        t2: T__,
        t3: T__,
        t4: T4,
        t5: T__,
        t6: T__,
    ): Curry5<T1, T2, T3, T5, T6, R>
    (
        t1: T__,
        t2: T__,
        t3: T3,
        t4: T__,
        t5: T__,
        t6: T__,
    ): Curry5<T1, T2, T4, T5, T6, R>
    (
        t1: T__,
        t2: T2,
        t3: T__,
        t4: T__,
        t5: T__,
        t6: T__,
    ): Curry5<T1, T3, T4, T5, T6, R>
    (
        t1: T1,
        t2: T__,
        t3: T__,
        t4: T__,
        t5: T__,
        t6: T__,
    ): Curry5<T2, T3, T4, T5, T6, R>
}

/**
 * Returns a curried equivalent of the provided function.
 *
 * Curried function can accept one or multiple parameter at the time:
 *
 * * `g(1)(2)(3)`
 * * `g(1)(2, 3)`
 * * `g(1, 2)(3)`
 * * `g(1, 2, 3)`
 *
 * The special placeholder value `__` may be used to specify "gaps", allowing partial application of any combination of arguments, regardless of their positions:
 *
 * * `g(1, 2, 3)`
 * * `g(_, 2, 3)(1)`
 * * `g(_, _, 3)(1)(2)`
 * * `g(_, _, 3)(1, 2)`
 * * `g(_, 2)(1)(3)`
 * * `g(_, 2)(1, 3)`
 * * `g(_, 2)(_, 3)(1)`
 * @example
 * ```
 * const addNumbers = (a, b, c, d) => a + b + c + d
 *
 * const addLastNumber = curry(addNumbers)(5, 5, 5)
 *
 * addLastNumber(5)
 *
 * const addFirst = curry(addNumbers)(__, 5, 5, 5)
 * addFirst(5)
 * ```
 * @group FP
 */
export function curry<T1, T2, R>(fn: (t1: T1, t2: T2) => R): Curry2<T1, T2, R>
export function curry<T1, T2, T3, R>(
    fn: (t1: T1, t2: T2, t3: T3) => R,
): Curry3<T1, T2, T3, R>
export function curry<T1, T2, T3, T4, R>(
    fn: (t1: T1, t2: T2, t3: T3, t4: T4) => R,
): Curry4<T1, T2, T3, T4, R>
export function curry<T1, T2, T3, T4, T5, R>(
    fn: (t1: T1, t2: T2, t3: T3, t4: T4, t5: T5) => R,
): Curry5<T1, T2, T3, T4, T5, R>
export function curry<T1, T2, T3, T4, T5, T6, R>(
    fn: (t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, t6: T6) => R,
): Curry6<T1, T2, T3, T4, T5, T6, R>
export function curry<T1, R>(fn: (t1: T1) => R): Curry1<T1, R>
export function curry(func: (...args: unknown[]) => unknown): unknown {
    return function curried(this: unknown, ...args: unknown[]) {
        if (args.some((v) => v instanceof Placeholder)) {
            return function (this: unknown, ...args2: unknown[]) {
                const args2Copy = [...args2]
                const argsCopy = args.map((v) =>
                    v instanceof Placeholder && args2Copy.length
                        ? args2Copy.shift()
                        : v,
                )
                return curried.apply(this, argsCopy.concat(args2Copy))
            }
        }

        if (args.length >= func.length) {
            return func.apply(this, args)
        } else {
            return function (this: unknown, ...args2: unknown[]) {
                return curried.apply(this, args.concat(args2))
            }
        }
    }
}

/**
 * Wraps callback to try/catch block
 *
 * @param callback
 * @returns
 * @example
 * ```
 * const result = tryCatch(() => fetch('http://example.com'))
 * if (value instanceof Error) {
 *     console.log(value.message)
 * }
 *
 * const parsedOrUndefined = tryCatch(() => JSON.parse(jsonString), undefined)
 * ```
 */
export function tryCatch<T>(callback: () => Promise<T>): Promise<T | Error>
export function tryCatch<T>(callback: () => T): T | Error
export function tryCatch<T, T2>(
    callback: () => Promise<T>,
    defaultValue: T2,
): Promise<T | T2>
export function tryCatch<T, T2>(callback: () => T, defaultValue: T2): T | T2
export function tryCatch<T, T2>(
    callback: () => T,
    defaultValue?: T2,
): T | T2 | Error | Promise<T | T2 | Error> {
    const defaultValueProvided = arguments.length === 2

    const handleError = (err: unknown) => {
        const error = ensureError(err)
        if (defaultValueProvided) {
            return defaultValue as T2
        }
        return error
    }

    try {
        const result = callback()
        if (typeof Promise !== 'undefined' && result instanceof Promise) {
            return result.catch(handleError)
        }

        return result
    } catch (err) {
        return handleError(err)
    }
}
