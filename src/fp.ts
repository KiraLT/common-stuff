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
 * @param value The initial value.
 * @param operations the list of operations to apply.
 * @category FP
 */
export function pipe<A, B>(value: A, op1: (input: A) => B): B
export function pipe<A, B, C>(
    value: A,
    op1: (input: A) => B,
    op2: (input: B) => C
): C
export function pipe<A, B, C, D>(
    value: A,
    op1: (input: A) => B,
    op2: (input: B) => C,
    op3: (input: C) => D
): D
export function pipe<A, B, C, D, E>(
    value: A,
    op1: (input: A) => B,
    op2: (input: B) => C,
    op3: (input: C) => D,
    op4: (input: D) => E
): E
export function pipe<A, B, C, D, E, F>(
    value: A,
    op1: (input: A) => B,
    op2: (input: B) => C,
    op3: (input: C) => D,
    op4: (input: D) => E,
    op5: (input: E) => F
): F
export function pipe<A, B, C, D, E, F, G>(
    value: A,
    op1: (input: A) => B,
    op2: (input: B) => C,
    op3: (input: C) => D,
    op4: (input: D) => E,
    op5: (input: E) => F,
    op6: (input: F) => G
): G
export function pipe<A, B, C, D, E, F, G, H>(
    value: A,
    op1: (input: A) => B,
    op2: (input: B) => C,
    op3: (input: C) => D,
    op4: (input: D) => E,
    op5: (input: E) => F,
    op6: (input: F) => G,
    op7: (input: G) => H
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

export function compose<T1, T2>(
    op1: (input: T1) => T2
) : (input: T1) => T2
export function compose<T1, T2, T3>(
    op2: (input: T2) => T3,
    op1: (input: T1) => T2
) : (input: T1) => T3
export function compose<T1, T2, T3, T4>(
    op3: (input: T3) => T4,
    op2: (input: T2) => T3,
    op1: (input: T1) => T2
) : (input: T1) => T4
export function compose<T1, T2, T3, T4, T5>(
    op4: (input: T4) => T5,
    op3: (input: T3) => T4,
    op2: (input: T2) => T3,
    op1: (input: T1) => T2
) : (input: T1) => T5
export function compose<T1, T2, T3, T4, T5, T6>(
    op5: (input: T5) => T6,
    op4: (input: T4) => T5,
    op3: (input: T3) => T4,
    op2: (input: T2) => T3,
    op1: (input: T1) => T2
) : (input: T1) => T6
export function compose<T1, T2, T3, T4, T5, T6, T7>(
    op6: (input: T6) => T7,
    op5: (input: T5) => T6,
    op4: (input: T4) => T5,
    op3: (input: T3) => T4,
    op2: (input: T2) => T3,
    op1: (input: T1) => T2
) : (input: T1) => T7
export function compose<T1, T2, T3, T4, T5, T6, T7, T8>(
    op7: (input: T7) => T8,
    op6: (input: T6) => T7,
    op5: (input: T5) => T6,
    op4: (input: T4) => T5,
    op3: (input: T3) => T4,
    op2: (input: T2) => T3,
    op1: (input: T1) => T2
) : (input: T1) => T8
export function compose(...operations: Array<(value: unknown) => unknown>): (value: unknown) => unknown
export function compose(...operations: Array<(value: unknown) => unknown>): (value: unknown) => unknown {
    return (value) => pipe(value, ...[...operations].reverse())
}
